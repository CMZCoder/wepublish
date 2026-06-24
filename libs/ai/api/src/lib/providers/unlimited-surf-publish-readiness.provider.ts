import type { PublishReadinessReviewInput } from '../publish-readiness-review.model';
import type {
  PublishReadinessReviewProvider,
  PublishReadinessReviewProviderResult,
} from '../publish-readiness-review.provider';

export const UNLIMITED_SURF_DEFAULT_BASE_URL = 'https://unlimited.surf/v1';
export const UNLIMITED_SURF_DEFAULT_MODEL = 'claude-sonnet-4-6-20260101';
export const UNLIMITED_SURF_DEFAULT_MAX_TOKENS = 420;
export const UNLIMITED_SURF_DEFAULT_REVIEW_MODELS = [
  UNLIMITED_SURF_DEFAULT_MODEL,
  'claude-opus-4-8-20260501',
  'claude-opus-4-7-20260101',
  'claude-opus-4-6-20251201',
  'claude-opus-4-5-20251101',
  'gpt-5.5',
  'gpt-5.4',
  'gpt-5.4-mini',
  'gpt-5.2',
] as const;
const UNLIMITED_SURF_DEFAULT_MAX_ATTEMPTS = 3;
const UNLIMITED_SURF_DEFAULT_RETRY_DELAY_MS = 750;

const UNLIMITED_SURF_MODEL_ID_PREFIX = 'unlimited-surf/';
const ANTHROPIC_VERSION = '2023-06-01';
const SYSTEM_PROMPT =
  'You are a fast editorial JSON generator. Return only minified JSON. Do not explain. Do not use markdown fences.';
const TRANSIENT_REVIEW_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MODEL_FALLBACK_STATUSES = new Set([404, ...TRANSIENT_REVIEW_STATUSES]);

type UnlimitedSurfEnv = Record<string, string | undefined>;

export interface UnlimitedSurfPublishReadinessProviderOptions {
  apiKey?: string;
  baseURL?: string;
  env?: UnlimitedSurfEnv;
  maxAttempts?: number;
  model?: string;
  models?: readonly string[];
  retryDelayMs?: number;
}

type AnthropicMessagesResponse = {
  content?: Array<{
    input?: unknown;
    text?: unknown;
    type?: unknown;
  }>;
};

export class UnlimitedSurfPublishReadinessProvider
  implements PublishReadinessReviewProvider
{
  readonly name = 'unlimited-surf';
  readonly model: string;

  private readonly apiKey?: string;
  private readonly baseURL: string;
  private readonly env: UnlimitedSurfEnv;
  private readonly maxAttempts: number;
  private readonly maxTokens: number;
  private readonly models: readonly string[];
  private readonly retryDelayMs: number;

  constructor(options: UnlimitedSurfPublishReadinessProviderOptions = {}) {
    this.env = options.env ?? process.env;
    this.apiKey =
      options.apiKey?.trim() || resolveUnlimitedSurfApiKey(this.env);
    this.baseURL = normalizeUnlimitedSurfBaseURL(
      options.baseURL ?? resolveUnlimitedSurfBaseURL(this.env)
    );
    this.models = resolveUnlimitedSurfReviewModels(
      this.env,
      options.model,
      options.models
    );
    this.model = this.models[0] ?? UNLIMITED_SURF_DEFAULT_MODEL;
    this.maxTokens = resolveUnlimitedSurfMaxTokens(
      this.env['PUBLISH_READINESS_UNLIMITED_SURF_MAX_TOKENS']
    );
    this.maxAttempts =
      options.maxAttempts ??
      resolveUnlimitedSurfMaxAttempts(
        this.env['PUBLISH_READINESS_UNLIMITED_SURF_MAX_ATTEMPTS']
      );
    this.retryDelayMs =
      options.retryDelayMs ??
      resolveUnlimitedSurfRetryDelayMs(
        this.env['PUBLISH_READINESS_UNLIMITED_SURF_RETRY_DELAY_MS']
      );
  }

  async review(
    _input: PublishReadinessReviewInput,
    prompt: string
  ): Promise<PublishReadinessReviewProviderResult> {
    const apiKey = this.apiKey || (await fetchUnlimitedSurfApiKey(this.env));

    if (!apiKey) {
      throw new Error('Unlimited Surf API key required');
    }

    let lastError: unknown;

    for (const model of this.models) {
      const requestBody = createUnlimitedSurfMessagesRequestBody(
        model,
        this.maxTokens,
        prompt
      );

      for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
        try {
          const response = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'x-api-key': apiKey,
              'anthropic-version': ANTHROPIC_VERSION,
              'Content-Type': 'application/json',
            },
            body: requestBody,
          });

          if (!response.ok) {
            const error = new Error(
              `Unlimited Surf review failed with ${response.status}`
            );

            await response.text().catch(() => undefined);

            if (
              attempt < this.maxAttempts &&
              TRANSIENT_REVIEW_STATUSES.has(response.status)
            ) {
              lastError = error;
              await waitForRetry(this.retryDelayMs);
              continue;
            }

            if (MODEL_FALLBACK_STATUSES.has(response.status)) {
              lastError = error;
              break;
            }

            throw error;
          }

          const data = (await response.json()) as AnthropicMessagesResponse;
          const content = extractAnthropicTextContent(data);

          if (!content) {
            throw new Error(
              'No publish readiness review returned by Unlimited Surf'
            );
          }

          if (!isPublishReadinessReviewJSON(content)) {
            lastError = new Error(
              'Unlimited Surf review returned invalid JSON'
            );
            break;
          }

          return { content, model };
        } catch (error) {
          if (attempt < this.maxAttempts && isTransientReviewError(error)) {
            lastError = error;
            await waitForRetry(this.retryDelayMs);
            continue;
          }

          if (isTransientReviewError(error)) {
            lastError = error;
            break;
          }

          throw error;
        }
      }
    }

    throw lastError instanceof Error ? lastError : (
        new Error('Unlimited Surf review failed')
      );
  }
}

export function normalizeUnlimitedSurfBaseURL(
  value: string | undefined
): string {
  const baseURL = (value?.trim() || UNLIMITED_SURF_DEFAULT_BASE_URL).replace(
    /\/+$/,
    ''
  );
  return baseURL.endsWith('/v1') ? baseURL : `${baseURL}/v1`;
}

export function resolveUnlimitedSurfBaseURL(
  env: UnlimitedSurfEnv = process.env
): string {
  const dedicatedKey =
    env['UNLIMITED_SURF_API_KEY'] || env['UNLIMITED_SURF_KEY'];

  if (dedicatedKey?.trim() && env['UNLIMITED_SURF_BASE_URL']?.trim()) {
    return normalizeUnlimitedSurfBaseURL(env['UNLIMITED_SURF_BASE_URL']);
  }

  if (isUnlimitedSurfGatewayURL(env['ANTHROPIC_BASE_URL'])) {
    return normalizeUnlimitedSurfBaseURL(env['ANTHROPIC_BASE_URL']);
  }

  if (env['UNLIMITED_SURF_BASE_URL']?.trim()) {
    return normalizeUnlimitedSurfBaseURL(env['UNLIMITED_SURF_BASE_URL']);
  }

  return UNLIMITED_SURF_DEFAULT_BASE_URL;
}

export function resolveUnlimitedSurfApiKey(
  env: UnlimitedSurfEnv = process.env
): string {
  const dedicatedKey =
    env['UNLIMITED_SURF_API_KEY'] || env['UNLIMITED_SURF_KEY'];

  if (dedicatedKey?.trim()) {
    return dedicatedKey.trim();
  }

  if (
    env['UNLIMITED_SURF_BASE_URL']?.trim() ||
    isUnlimitedSurfGatewayURL(env['ANTHROPIC_BASE_URL'])
  ) {
    return env['ANTHROPIC_AUTH_TOKEN']?.trim() || '';
  }

  return '';
}

export function resolveUnlimitedSurfModel(
  value = UNLIMITED_SURF_DEFAULT_MODEL
): string {
  const model = value.trim() || UNLIMITED_SURF_DEFAULT_MODEL;

  return model.startsWith(UNLIMITED_SURF_MODEL_ID_PREFIX) ?
      model.slice(UNLIMITED_SURF_MODEL_ID_PREFIX.length)
    : model;
}

export function resolveUnlimitedSurfReviewModels(
  env: UnlimitedSurfEnv = process.env,
  primaryModel?: string,
  explicitModels?: readonly string[]
): string[] {
  const configuredModels =
    explicitModels?.length ?
      [...explicitModels]
    : parseUnlimitedSurfModelList(
        env['PUBLISH_READINESS_UNLIMITED_SURF_MODELS'] ??
          env['UNLIMITED_SURF_MODELS']
      );
  const primary =
    primaryModel ??
    env['PUBLISH_READINESS_UNLIMITED_SURF_MODEL'] ??
    env['UNLIMITED_SURF_MODEL'];
  const candidates =
    configuredModels.length > 0 ?
      configuredModels
    : [primary, ...UNLIMITED_SURF_DEFAULT_REVIEW_MODELS];
  const allowedModels = unique(
    candidates
      .filter((model): model is string => typeof model === 'string')
      .map(resolveUnlimitedSurfModel)
      .filter(isAllowedUnlimitedSurfReviewModel)
  );

  return allowedModels.length > 0 ?
      allowedModels
    : [UNLIMITED_SURF_DEFAULT_MODEL];
}

export function resolveUnlimitedSurfMaxTokens(
  value: string | undefined
): number {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed >= 120 && parsed <= 1200) {
    return parsed;
  }

  return UNLIMITED_SURF_DEFAULT_MAX_TOKENS;
}

export function resolveUnlimitedSurfMaxAttempts(
  value: string | undefined
): number {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) {
    return parsed;
  }

  return UNLIMITED_SURF_DEFAULT_MAX_ATTEMPTS;
}

export function resolveUnlimitedSurfRetryDelayMs(
  value: string | undefined
): number {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5000) {
    return parsed;
  }

  return UNLIMITED_SURF_DEFAULT_RETRY_DELAY_MS;
}

export async function fetchUnlimitedSurfApiKey(
  env: UnlimitedSurfEnv = process.env
): Promise<string> {
  const configuredKey = resolveUnlimitedSurfApiKey(env);

  if (configuredKey) {
    return configuredKey;
  }

  const response = await fetch(
    `${normalizeUnlimitedSurfRootURL(resolveUnlimitedSurfBaseURL(env))}/api/key`
  );

  if (!response.ok) {
    throw new Error(`Unlimited Surf /api/key failed with ${response.status}`);
  }

  const payload = (await response.json()) as { key?: unknown };

  if (typeof payload.key !== 'string' || payload.key.trim().length === 0) {
    throw new Error('Unlimited Surf /api/key did not return a key');
  }

  return payload.key.trim();
}

function normalizeUnlimitedSurfRootURL(value: string | undefined): string {
  return normalizeUnlimitedSurfBaseURL(value).replace(/\/v1$/, '');
}

function isUnlimitedSurfGatewayURL(value: string | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }

  try {
    const hostname = new URL(value.trim()).hostname.toLowerCase();
    return hostname.includes('unlimited') || hostname.includes('quatarly');
  } catch {
    return false;
  }
}

function extractAnthropicTextContent(data: AnthropicMessagesResponse): string {
  const toolInput = data.content?.find(entry => {
    return entry.type === 'tool_use' && isObject(entry.input);
  })?.input;

  if (isObject(toolInput)) {
    return JSON.stringify(toolInput);
  }

  const content =
    data.content
      ?.map(entry => {
        return entry.type === 'text' && typeof entry.text === 'string' ?
            entry.text.trim()
          : '';
      })
      .find(Boolean) ?? '';

  return extractJSONPayload(content);
}

function createUnlimitedSurfMessagesRequestBody(
  model: string,
  maxTokens: number,
  prompt: string
): string {
  return JSON.stringify({
    model,
    max_tokens: maxTokens,
    temperature: 0,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: 'publish_readiness_review',
        description: 'Return a compact publish readiness review.',
        input_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  category: {
                    type: 'string',
                    enum: ['lead', 'seo-social', 'aeo-geo', 'editorial-risk'],
                  },
                  title: { type: 'string' },
                  currentValue: { type: 'string' },
                  suggestedValue: { type: 'string' },
                  rationale: { type: 'string' },
                  confidence: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                  },
                },
                required: [
                  'id',
                  'category',
                  'title',
                  'rationale',
                  'confidence',
                ],
              },
            },
            warnings: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['summary', 'suggestions', 'warnings'],
        },
      },
    ],
    tool_choice: {
      type: 'tool',
      name: 'publish_readiness_review',
    },
    messages: [
      {
        role: 'user',
        content: prompt.trim(),
      },
    ],
  });
}

function parseUnlimitedSurfModelList(value: string | undefined): string[] {
  return (
    value
      ?.split(/[,\n]/)
      .map(model => model.trim())
      .filter(Boolean) ?? []
  );
}

function isAllowedUnlimitedSurfReviewModel(model: string): boolean {
  return isClaude45OrNewerModel(model) || isGpt52OrNewerModel(model);
}

function isClaude45OrNewerModel(model: string): boolean {
  const parts = model.split('-');

  if (parts[0] !== 'claude' || parts.length < 4) {
    return false;
  }

  const major = Number(parts[2]);
  const nextVersionPart = parts[3];
  const minor = /^\d{1,2}$/.test(nextVersionPart) ? Number(nextVersionPart) : 0;

  return major > 4 || (major === 4 && minor >= 5);
}

function isGpt52OrNewerModel(model: string): boolean {
  const match = model.match(/^gpt-(\d+)(?:\.(\d+))?/);

  if (!match) {
    return false;
  }

  const major = Number(match[1]);
  const minor = Number(match[2] ?? 0);

  return major > 5 || (major === 5 && minor >= 2);
}

function extractJSONPayload(content: string): string {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = (fencedMatch?.[1] ?? trimmed).trim();

  if (candidate.startsWith('{') && candidate.endsWith('}')) {
    return candidate;
  }

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start >= 0 && end > start) {
    return candidate.slice(start, end + 1).trim();
  }

  return candidate;
}

function isPublishReadinessReviewJSON(content: string): boolean {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    return false;
  }

  return (
    isObject(parsed) &&
    typeof parsed['summary'] === 'string' &&
    Array.isArray(parsed['suggestions']) &&
    Array.isArray(parsed['warnings'])
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTransientReviewError(error: unknown): boolean {
  return error instanceof TypeError || error instanceof DOMException;
}

async function waitForRetry(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }

  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
