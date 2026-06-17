import { PrismaClient } from '@prisma/client';
import { KvTtlCacheService } from '@wepublish/kv-ttl-cache/api';
import { createClient, type ChatsCreateResponse } from 'v0-sdk';

import type { PublishReadinessReviewInput } from '../publish-readiness-review.model';
import type { PublishReadinessReviewProvider } from '../publish-readiness-review.provider';
import { V0Config } from '../v0.config';

export class V0PublishReadinessProvider
  implements PublishReadinessReviewProvider
{
  readonly name = 'v0';
  readonly model = 'v0';

  constructor(
    private readonly prisma: PrismaClient,
    private readonly kv: KvTtlCacheService
  ) {}

  async review(
    _input: PublishReadinessReviewInput,
    prompt: string
  ): Promise<string> {
    const config = new V0Config(this.prisma, this.kv, 'v0');
    const apiKey = await config.apiKey();

    if (!apiKey) {
      throw new Error('V0 API key required');
    }

    const client = createClient({ apiKey });
    const chat = await client.chats.create({
      message: prompt.trim(),
      system: (await config.systemPrompt())?.trim() ?? '',
      responseMode: 'sync',
      modelConfiguration: {
        thinking: false,
      },
    });

    const content = extractV0Content(chat as ChatsCreateResponse);

    if (!content) {
      throw new Error('No publish readiness review returned by v0');
    }

    return content;
  }
}

function extractV0Content(chat: ChatsCreateResponse): string {
  const candidates = [
    chat.text,
    ...chat.messages.map(message => message.content),
    ...chat.messages.flatMap(message => {
      return (
        message.experimental_content?.flatMap(extractExperimentalContent) ?? []
      );
    }),
  ]
    .filter((candidate): candidate is string => typeof candidate === 'string')
    .map(candidate => candidate.trim())
    .filter(Boolean);

  return (
    candidates.find(
      candidate => candidate.startsWith('{') && candidate.endsWith('}')
    ) ??
    candidates[0] ??
    ''
  );
}

function extractExperimentalContent(content: unknown[]): string[] {
  const [, payload, fallback] = content;

  if (typeof fallback === 'string') return [fallback];

  if (!Array.isArray(payload)) return [];

  return payload.flatMap(entry => {
    if (!Array.isArray(entry)) return [];

    const value = entry[2];

    return typeof value === 'string' ? [value] : [];
  });
}
