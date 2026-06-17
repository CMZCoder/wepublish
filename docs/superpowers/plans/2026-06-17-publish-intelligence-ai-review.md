# Publish Intelligence AI Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an optional AI-assisted review lane for Publish Intelligence that gives editors actionable SEO/AEO/GEO suggestions while preserving the deterministic v1 publish-readiness score.

**Architecture:** Keep `libs/ui/editor` as the owner of deterministic readiness and publish-modal composition. Put reusable AI review presentation components in `libs/ai/editor`, and put provider-backed review orchestration in `libs/ai/api` behind a new structured GraphQL mutation. Production uses the existing `v0` AI setting first; local development can test a free Ollama Cloud model through the local Ollama HTTP API without changing Prisma provider settings.

**Tech Stack:** React 18, Emotion, MUI theme tokens, Apollo generated hooks, NestJS GraphQL, Prisma `SettingAIProvider`, `v0-sdk`, Node 22 `fetch`, Jest, Nx, Storybook/browser proof, `npm run generate-api`.

---

## Source And Discipline Notes

- Start every implementation session in `/home/void/ExternalRepos/wepublish`.
- Run `env PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH node .wepublish-agent/agent-lite.mjs autoload --description "Implement Publish Intelligence Level 2 AI review"` before editing.
- Do not push, open PRs, comment on PRs, merge, or delete branches without explicit current-turn user approval.
- Leave existing untracked `apps/*/tsconfig.tsbuildinfo` files and `apps/mediamakerscamp/` untouched.
- Use Node 22.20.x for proof commands. Avoid full Docker/dev stack unless the user approves it.
- Claims about AI must say "suggests" or "flags", not "proves", "validates", or "guarantees".

## File Structure

Create or modify these files only unless a test reveals a direct owner boundary miss:

- Create `libs/ai/editor/src/lib/publish-readiness-ai-review.tsx`: reusable presentational component for unavailable, ready, loading, suggestions, and error states.
- Create `libs/ai/editor/src/lib/publish-readiness-ai-review.spec.tsx`: component tests for states and contrast/accessibility basics.
- Modify `libs/ai/editor/src/index.ts`: export the new component and types.
- Modify `libs/ui/editor/src/lib/panel/publishReadiness.ts`: export reusable plain-text readiness signals without changing v1 scoring.
- Create `libs/ui/editor/src/lib/panel/publishReadinessReviewContext.ts`: convert `PublishReadinessInput` and deterministic results into bounded AI-review context.
- Create `libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts`: tests for privacy-preserving request context.
- Modify `libs/ui/editor/src/lib/panel/publishReadinessPanel.tsx`: accept optional AI review controller and render the AI lane.
- Create `libs/ui/editor/src/lib/panel/publishReadinessPanelWithAI.tsx`: container that builds the AI controller from generated GraphQL hooks.
- Modify `libs/ui/editor/src/lib/panel/publishArticlePanel.tsx`: use the AI-enabled container in the article publish modal.
- Modify `libs/ui/editor/src/lib/panel/publishPagePanel.tsx`: use the AI-enabled container in the page publish modal.
- Modify `libs/ui/editor/src/lib/panel/index.ts`: export the AI-enabled container if panel exports need it.
- Create `libs/editor/api/src/lib/schemas/publish-readiness-review.graphql`: editor mutation document for codegen.
- Create `libs/ai/api/src/lib/v0.config.ts`: extract the existing encrypted v0 config loader from `v0.resolver.ts`.
- Modify `libs/ai/api/src/lib/v0.resolver.ts`: use `V0Config` from the extracted file.
- Create `libs/ai/api/src/lib/publish-readiness-review.model.ts`: GraphQL input and output model classes.
- Create `libs/ai/api/src/lib/publish-readiness-review.provider.ts`: provider adapter interface and common error helpers.
- Create `libs/ai/api/src/lib/publish-readiness-review.prompt.ts`: bounded prompt builder and JSON schema instructions.
- Create `libs/ai/api/src/lib/publish-readiness-review.parser.ts`: strict JSON parser for provider responses.
- Create `libs/ai/api/src/lib/providers/v0-publish-readiness.provider.ts`: product provider using current `v0` setting.
- Create `libs/ai/api/src/lib/providers/ollama-publish-readiness.provider.ts`: local dev provider using `OLLAMA_HOST` and `OLLAMA_MODEL`.
- Create `libs/ai/api/src/lib/publish-readiness-review.service.ts`: provider selection and orchestration.
- Create `libs/ai/api/src/lib/publish-readiness-review.resolver.ts`: GraphQL mutation with editor permissions.
- Create `libs/ai/api/src/lib/publish-readiness-review.service.spec.ts`: backend service/parser tests with mocked providers.
- Modify `libs/ai/api/src/lib/v0.module.ts`: provide and export the new resolver/service while keeping existing imports stable.
- Modify `libs/ai/api/src/index.ts`: export the new API model/module pieces.
- Update generated files after schema changes: `apps/api-example/schema-v2.graphql`, `libs/editor/api/src/lib/graphql.ts`, and any other file touched by `npm run generate-api`.

## Task 1: Protect The Existing Deterministic Contract

**Files:**
- Modify: `libs/ui/editor/src/lib/panel/publishReadiness.ts`
- Test: `libs/ui/editor/src/lib/panel/publishReadiness.spec.ts`

- [ ] **Step 1: Add failing tests for exported signals without changing score**

Append this test to `libs/ui/editor/src/lib/panel/publishReadiness.spec.ts`:

```ts
it('exports bounded content signals without changing deterministic scoring', () => {
  const input: PublishReadinessInput = {
    type: 'article',
    publishedAt: new Date('2026-06-17T10:00:00.000Z'),
    metadata: {
      slug: 'zurich-climate-plan-2026',
      title: 'Zurich presents climate plan for 2026',
      lead: 'Zurich presented its 2026 climate plan with transport measures.',
      authors: [{ name: 'Lina Meier' }],
      tags: ['climate'],
      image: { filename: 'zurich.jpg' },
      hidden: false,
      hideAuthor: false,
    },
    blocks: [
      {
        key: 'intro',
        type: EditorBlockType.RichText,
        value: {
          richText: [
            {
              type: BlockFormat.Paragraph,
              children: [
                {
                  text: 'Zurich officials said the 2026 plan affects 420000 residents and focuses on public transport.',
                },
                {
                  type: InlineFormat.Link,
                  url: 'https://stadt-zuerich.example/source',
                  title: 'source',
                  children: [{ text: 'City source' }],
                },
              ],
            },
          ],
        },
      },
    ],
  };

  const before = getPublishReadiness(input);
  const signals = getPublishReadinessSignals(input.blocks ?? []);
  const after = getPublishReadiness(input);

  expect(signals.firstParagraph).toContain('Zurich officials');
  expect(signals.sourceLinks).toEqual(['https://stadt-zuerich.example/source']);
  expect(after).toEqual(before);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadiness.spec.ts
```

Expected: FAIL because `getPublishReadinessSignals` is not exported.

- [ ] **Step 3: Export the bounded signal type and function**

In `libs/ui/editor/src/lib/panel/publishReadiness.ts`, rename `interface ContentSignals` to:

```ts
export interface PublishReadinessSignals {
  readonly text: string;
  readonly firstParagraph: string;
  readonly headingCount: number;
  readonly listCount: number;
  readonly sourceLinks: string[];
  readonly imageCount: number;
  readonly captionCount: number;
}
```

Then update references from `ContentSignals` to `PublishReadinessSignals`, and add:

```ts
export function getPublishReadinessSignals(
  blocks: readonly BlockValue[] = []
): PublishReadinessSignals {
  return getContentSignals(blocks);
}
```

Keep `getContentSignals` private and keep `getPublishReadiness()` behavior unchanged.

- [ ] **Step 4: Run deterministic readiness tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadiness.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/editor/src/lib/panel/publishReadiness.ts libs/ui/editor/src/lib/panel/publishReadiness.spec.ts
git commit -m "test(editor): expose publish readiness signals"
```

## Task 2: Build Privacy-Preserving AI Review Context

**Files:**
- Create: `libs/ui/editor/src/lib/panel/publishReadinessReviewContext.ts`
- Create: `libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts`

- [ ] **Step 1: Write failing context tests**

Create `libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts`:

```ts
import { EditorBlockType } from '@wepublish/editor/api';
import { BlockFormat } from '@wepublish/richtext';

import type { PublishReadinessInput } from './publishReadiness';
import { getPublishReadiness } from './publishReadiness';
import { getPublishReadinessReviewContext } from './publishReadinessReviewContext';

describe('getPublishReadinessReviewContext', () => {
  it('keeps only bounded metadata, deterministic findings, and plain text signals', () => {
    const input: PublishReadinessInput = {
      type: 'article',
      publishedAt: new Date('2026-06-17T10:00:00.000Z'),
      metadata: {
        slug: 'zurich-climate-plan-2026',
        title: 'Zurich presents climate plan for 2026',
        seoTitle: 'Zurich climate plan 2026',
        lead: 'Zurich presented its 2026 climate plan with new transport measures.',
        authors: [{ name: 'Lina Meier' }],
        tags: ['climate', 'zurich'],
        image: { filename: 'zurich.jpg' },
        socialMediaDescription: 'Transport, housing and energy changes for Zurich residents.',
        hidden: false,
        hideAuthor: false,
        canonicalUrl: 'https://example.com/zurich-climate-plan-2026',
        url: 'https://publisher.example/zurich-climate-plan-2026',
      },
      blocks: [
        {
          key: 'intro',
          type: EditorBlockType.RichText,
          value: {
            richText: [
              {
                type: BlockFormat.Paragraph,
                children: [
                  {
                    text: 'Zurich officials said the 2026 plan affects 420000 residents.',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const context = getPublishReadinessReviewContext(
      input,
      getPublishReadiness(input)
    );

    expect(context.contentType).toBe('article');
    expect(context.metadata.title).toBe('Zurich presents climate plan for 2026');
    expect(context.metadata.authors).toEqual(['Lina Meier']);
    expect(context.signals.firstParagraph).toContain('Zurich officials');
    expect(context.deterministicChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'opening-context-signals' }),
      ])
    );
    expect(JSON.stringify(context)).not.toContain('key');
    expect(JSON.stringify(context)).not.toContain('richText');
  });

  it('truncates long plain text before sending it to an AI provider', () => {
    const longText = 'Zurich '.repeat(600);
    const input: PublishReadinessInput = {
      type: 'page',
      metadata: {
        slug: 'long-page',
        title: 'Long page',
        description: 'A long page with too much body text.',
      },
      blocks: [
        {
          key: 'html',
          type: EditorBlockType.Html,
          value: { html: `<p>${longText}</p>` },
        },
      ],
    };

    const context = getPublishReadinessReviewContext(
      input,
      getPublishReadiness(input)
    );

    expect(context.signals.text.length).toBeLessThanOrEqual(2200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts
```

Expected: FAIL because `publishReadinessReviewContext.ts` does not exist.

- [ ] **Step 3: Implement the context helper**

Create `libs/ui/editor/src/lib/panel/publishReadinessReviewContext.ts`:

```ts
import type {
  PublishReadinessCheck,
  PublishReadinessInput,
  PublishReadinessResult,
  PublishReadinessSignals,
} from './publishReadiness';
import { getPublishReadinessSignals } from './publishReadiness';

export interface PublishReadinessReviewContext {
  readonly contentType: PublishReadinessInput['type'];
  readonly metadata: {
    readonly slug?: string | null;
    readonly title?: string | null;
    readonly seoTitle?: string | null;
    readonly leadOrDescription?: string | null;
    readonly socialMediaTitle?: string | null;
    readonly socialMediaDescription?: string | null;
    readonly canonicalUrl?: string | null;
    readonly url?: string | null;
    readonly authors: string[];
    readonly tags: string[];
    readonly hasImage: boolean;
    readonly hidden: boolean;
    readonly hideAuthor: boolean;
    readonly publishedAt?: string;
  };
  readonly deterministicStatus: PublishReadinessResult['status'];
  readonly deterministicScore: number;
  readonly deterministicChecks: readonly Pick<
    PublishReadinessCheck,
    'id' | 'category' | 'status'
  >[];
  readonly signals: PublishReadinessSignals;
}

const MAX_SIGNAL_TEXT_LENGTH = 2200;

export function getPublishReadinessReviewContext(
  input: PublishReadinessInput,
  result: PublishReadinessResult
): PublishReadinessReviewContext {
  const signals = getPublishReadinessSignals(input.blocks ?? []);
  const metadata = input.metadata;

  return {
    contentType: input.type,
    metadata: {
      slug: metadata.slug,
      title: metadata.title,
      seoTitle: metadata.seoTitle,
      leadOrDescription:
        input.type === 'article' ? metadata.lead : metadata.description,
      socialMediaTitle: metadata.socialMediaTitle,
      socialMediaDescription: metadata.socialMediaDescription,
      canonicalUrl: metadata.canonicalUrl,
      url: metadata.url,
      authors: compactNames(metadata.authors),
      tags: [...(metadata.tags ?? [])],
      hasImage: Boolean(metadata.socialMediaImage || metadata.image),
      hidden: Boolean(metadata.hidden),
      hideAuthor: Boolean(metadata.hideAuthor),
      publishedAt: input.publishedAt?.toISOString(),
    },
    deterministicStatus: result.status,
    deterministicScore: result.score,
    deterministicChecks: result.checks.map(({ id, category, status }) => ({
      id,
      category,
      status,
    })),
    signals: {
      ...signals,
      text: truncate(signals.text, MAX_SIGNAL_TEXT_LENGTH),
      firstParagraph: truncate(signals.firstParagraph, 700),
      sourceLinks: signals.sourceLinks.slice(0, 8),
    },
  };
}

function compactNames(
  names: PublishReadinessInput['metadata']['authors']
): string[] {
  return (names ?? [])
    .map(author => author?.name?.trim())
    .filter((name): name is string => Boolean(name));
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}
```

- [ ] **Step 4: Run context tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/editor/src/lib/panel/publishReadinessReviewContext.ts libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts
git commit -m "feat(editor): prepare publish readiness review context"
```

## Task 3: Build Reusable AI Review Presentation

**Files:**
- Create: `libs/ai/editor/src/lib/publish-readiness-ai-review.tsx`
- Create: `libs/ai/editor/src/lib/publish-readiness-ai-review.spec.tsx`
- Modify: `libs/ai/editor/src/index.ts`

- [ ] **Step 1: Write failing component tests**

Create `libs/ai/editor/src/lib/publish-readiness-ai-review.spec.tsx`:

```tsx
import '@testing-library/jest-dom';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

import {
  PublishReadinessAIReview,
  type PublishReadinessAIReviewController,
} from './publish-readiness-ai-review';

const theme = createTheme();
const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('PublishReadinessAIReview', () => {
  it('renders unavailable state without implying AI validation', () => {
    renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'unavailable',
          message: 'Configure an AI provider to run editorial suggestions.',
        }}
      />
    );

    expect(screen.getByText('AI review')).toBeInTheDocument();
    expect(screen.getByText(/deterministic checks still work/i)).toBeInTheDocument();
    expect(screen.queryByText(/validated/i)).not.toBeInTheDocument();
  });

  it('runs manual review from ready state', async () => {
    const onReview = jest.fn();

    renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'ready',
          onReview,
        }}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /run ai review/i }));
    expect(onReview).toHaveBeenCalledTimes(1);
  });

  it('renders grouped suggestions and human-review warnings', () => {
    renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'suggestions',
          summary: 'The piece can answer the main question earlier.',
          suggestions: [
            {
              id: 'lead-1',
              category: 'lead',
              title: 'Make the lead answer-first',
              suggestedValue: 'Zurich plans transport changes for 2026.',
              rationale: 'The current opening delays the practical answer.',
              confidence: 'medium',
            },
          ],
          warnings: ['Verify the quoted resident count before publishing.'],
          onReview: jest.fn(),
        }}
      />
    );

    expect(screen.getByText('The piece can answer the main question earlier.')).toBeInTheDocument();
    expect(screen.getByText('Make the lead answer-first')).toBeInTheDocument();
    expect(screen.getByText(/Verify the quoted resident count/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-editor --runInBand --testFile=libs/ai/editor/src/lib/publish-readiness-ai-review.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the component**

Create `libs/ai/editor/src/lib/publish-readiness-ai-review.tsx` with these public types and behavior:

```tsx
import styled from '@emotion/styled';
import { Button, CircularProgress } from '@mui/material';
import { MdAutoFixHigh, MdErrorOutline, MdInfoOutline } from 'react-icons/md';

export type AIReviewState =
  | 'unavailable'
  | 'ready'
  | 'loading'
  | 'suggestions'
  | 'error';

export type AIReviewSuggestionCategory =
  | 'lead'
  | 'seo-social'
  | 'aeo-geo'
  | 'editorial-risk';

export interface AIReviewSuggestion {
  readonly id: string;
  readonly category: AIReviewSuggestionCategory;
  readonly title: string;
  readonly currentValue?: string | null;
  readonly suggestedValue?: string | null;
  readonly rationale: string;
  readonly confidence: 'low' | 'medium' | 'high';
}

export interface PublishReadinessAIReviewController {
  readonly state: AIReviewState;
  readonly message?: string;
  readonly summary?: string;
  readonly suggestions?: readonly AIReviewSuggestion[];
  readonly warnings?: readonly string[];
  readonly onReview?: () => void | Promise<void>;
}

const Root = styled.section`
  background: ${({ theme }) => theme.palette.common.white};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  display: grid;
  gap: 12px;
  padding: 12px;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const Title = styled.h4`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
`;

const SuggestionList = styled.ul`
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Suggestion = styled.li`
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  display: grid;
  gap: 5px;
  padding: 10px;
`;

const SuggestionTitle = styled.strong`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 12px;
`;

const Value = styled.code`
  background: ${({ theme }) => theme.palette.grey[50]};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 6px;
  color: ${({ theme }) => theme.palette.text.primary};
  font-family: inherit;
  font-size: 12px;
  overflow-wrap: anywhere;
  padding: 6px;
`;

const WarningList = styled.ul`
  color: ${({ theme }) => theme.palette.warning.dark};
  display: grid;
  font-size: 12px;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
`;

export function PublishReadinessAIReview({
  controller,
}: {
  readonly controller: PublishReadinessAIReviewController;
}) {
  const disabled = controller.state === 'loading' || !controller.onReview;

  return (
    <Root aria-label="AI review">
      <Header>
        <Title>
          <MdAutoFixHigh aria-hidden="true" /> AI review
        </Title>
        {controller.state !== 'unavailable' && (
          <Button
            size="small"
            variant="outlined"
            onClick={controller.onReview}
            disabled={disabled}
          >
            {controller.state === 'loading' ? (
              <CircularProgress size={14} />
            ) : (
              'Run AI review'
            )}
          </Button>
        )}
      </Header>

      {controller.state === 'unavailable' && (
        <Text>
          <MdInfoOutline aria-hidden="true" />{' '}
          {controller.message ??
            'Configure an AI provider to run editorial suggestions. Deterministic checks still work.'}
        </Text>
      )}

      {controller.state === 'ready' && (
        <Text>
          AI can suggest editorial improvements from the deterministic findings.
          It does not verify facts, ranking, or citation likelihood.
        </Text>
      )}

      {controller.state === 'loading' && (
        <Text>Generating editorial suggestions from bounded review context.</Text>
      )}

      {controller.state === 'error' && (
        <Text>
          <MdErrorOutline aria-hidden="true" />{' '}
          {controller.message ?? 'AI review failed. Deterministic checks remain available.'}
        </Text>
      )}

      {controller.state === 'suggestions' && (
        <>
          {controller.summary && <Text>{controller.summary}</Text>}
          <SuggestionList>
            {(controller.suggestions ?? []).map(suggestion => (
              <Suggestion key={suggestion.id}>
                <SuggestionTitle>{suggestion.title}</SuggestionTitle>
                {suggestion.suggestedValue && (
                  <Value>{suggestion.suggestedValue}</Value>
                )}
                <Text>{suggestion.rationale}</Text>
                <Text>Confidence: {suggestion.confidence}</Text>
              </Suggestion>
            ))}
          </SuggestionList>
          {!!controller.warnings?.length && (
            <WarningList>
              {controller.warnings.map(warning => (
                <li key={warning}>{warning}</li>
              ))}
            </WarningList>
          )}
        </>
      )}
    </Root>
  );
}
```

- [ ] **Step 4: Export the component**

Replace `libs/ai/editor/src/index.ts` with:

```ts
export * from './lib/publish-readiness-ai-review';
```

- [ ] **Step 5: Run AI editor tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-editor --runInBand --testFile=libs/ai/editor/src/lib/publish-readiness-ai-review.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add libs/ai/editor/src/index.ts libs/ai/editor/src/lib/publish-readiness-ai-review.tsx libs/ai/editor/src/lib/publish-readiness-ai-review.spec.tsx
git commit -m "feat(ai-editor): add publish readiness review lane"
```

## Task 4: Compose The AI Lane Into The Publish Readiness Panel

**Files:**
- Modify: `libs/ui/editor/src/lib/panel/publishReadinessPanel.tsx`
- Modify: `libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx`

- [ ] **Step 1: Add failing panel test**

Append this test to `libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx`:

```tsx
it('renders optional AI review lane without changing the deterministic score', () => {
  render(
    <PublishReadinessPanel
      result={{
        status: 'review',
        score: 74,
        checks: [
          {
            id: 'slug',
            category: 'editorial',
            status: 'pass',
          },
        ],
      }}
      aiReview={{
        state: 'ready',
        onReview: jest.fn(),
      }}
    />
  );

  expect(screen.getByText('74%')).toBeInTheDocument();
  expect(screen.getByLabelText('AI review')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /run ai review/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run panel test to verify it fails**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx
```

Expected: FAIL because `aiReview` is not a prop.

- [ ] **Step 3: Add optional prop and render component**

Modify the imports in `publishReadinessPanel.tsx`:

```ts
import {
  PublishReadinessAIReview,
  type PublishReadinessAIReviewController,
} from '@wepublish/ai/editor';
```

Extend `PublishReadinessPanelProps`:

```ts
export interface PublishReadinessPanelProps {
  readonly input?: PublishReadinessInput;
  readonly result?: PublishReadinessResult;
  readonly aiReview?: PublishReadinessAIReviewController;
}
```

Accept the prop:

```ts
export function PublishReadinessPanel({
  input,
  result,
  aiReview,
}: PublishReadinessPanelProps) {
```

Render it after the category grid inside `<Body>`:

```tsx
{aiReview && <PublishReadinessAIReview controller={aiReview} />}
```

- [ ] **Step 4: Run UI editor tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/editor/src/lib/panel/publishReadinessPanel.tsx libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx
git commit -m "feat(editor): compose AI review into publish readiness"
```

## Task 5: Add Backend Review Models And Strict Parser

**Files:**
- Create: `libs/ai/api/src/lib/publish-readiness-review.model.ts`
- Create: `libs/ai/api/src/lib/publish-readiness-review.parser.ts`
- Create: `libs/ai/api/src/lib/publish-readiness-review.parser.spec.ts`

- [ ] **Step 1: Write parser tests**

Create `libs/ai/api/src/lib/publish-readiness-review.parser.spec.ts`:

```ts
import { BadRequestException } from '@nestjs/common';

import { parsePublishReadinessReview } from './publish-readiness-review.parser';

describe('parsePublishReadinessReview', () => {
  it('accepts a structured JSON review response', () => {
    const review = parsePublishReadinessReview(
      JSON.stringify({
        summary: 'The piece should answer the core question earlier.',
        suggestions: [
          {
            id: 'lead-1',
            category: 'lead',
            title: 'Move the practical answer into the lead',
            suggestedValue: 'Zurich plans transport changes for 2026.',
            rationale: 'This makes the answer visible before background detail.',
            confidence: 'medium',
          },
        ],
        warnings: ['Verify the resident count before publishing.'],
      })
    );

    expect(review.summary).toContain('answer');
    expect(review.suggestions).toHaveLength(1);
    expect(review.warnings).toEqual(['Verify the resident count before publishing.']);
  });

  it('rejects malformed JSON instead of rendering untrusted output', () => {
    expect(() => parsePublishReadinessReview('<p>Not JSON</p>')).toThrow(
      BadRequestException
    );
  });

  it('rejects invalid confidence values', () => {
    expect(() =>
      parsePublishReadinessReview(
        JSON.stringify({
          summary: 'Bad confidence',
          suggestions: [
            {
              id: 'bad',
              category: 'lead',
              title: 'Bad',
              rationale: 'Bad',
              confidence: 'certain',
            },
          ],
          warnings: [],
        })
      )
    ).toThrow(BadRequestException);
  });
});
```

- [ ] **Step 2: Run parser test to verify it fails**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-api --runInBand --testFile=libs/ai/api/src/lib/publish-readiness-review.parser.spec.ts
```

Expected: FAIL because parser files do not exist.

- [ ] **Step 3: Implement GraphQL model classes**

Create `libs/ai/api/src/lib/publish-readiness-review.model.ts`:

```ts
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class PublishReadinessReviewCheckInput {
  @Field()
  id!: string;

  @Field()
  category!: string;

  @Field()
  status!: string;
}

@InputType()
export class PublishReadinessReviewMetadataInput {
  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  seoTitle?: string;

  @Field({ nullable: true })
  leadOrDescription?: string;

  @Field({ nullable: true })
  socialMediaTitle?: string;

  @Field({ nullable: true })
  socialMediaDescription?: string;

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => [String])
  authors!: string[];

  @Field(() => [String])
  tags!: string[];

  @Field()
  hasImage!: boolean;

  @Field()
  hidden!: boolean;

  @Field()
  hideAuthor!: boolean;

  @Field({ nullable: true })
  publishedAt?: string;
}

@InputType()
export class PublishReadinessReviewSignalsInput {
  @Field()
  text!: string;

  @Field()
  firstParagraph!: string;

  @Field(() => Int)
  headingCount!: number;

  @Field(() => Int)
  listCount!: number;

  @Field(() => [String])
  sourceLinks!: string[];

  @Field(() => Int)
  imageCount!: number;

  @Field(() => Int)
  captionCount!: number;
}

@InputType()
export class PublishReadinessReviewInput {
  @Field()
  contentType!: string;

  @Field(() => PublishReadinessReviewMetadataInput)
  metadata!: PublishReadinessReviewMetadataInput;

  @Field()
  deterministicStatus!: string;

  @Field(() => Int)
  deterministicScore!: number;

  @Field(() => [PublishReadinessReviewCheckInput])
  deterministicChecks!: PublishReadinessReviewCheckInput[];

  @Field(() => PublishReadinessReviewSignalsInput)
  signals!: PublishReadinessReviewSignalsInput;
}

@ObjectType()
export class PublishReadinessReviewSuggestion {
  @Field()
  id!: string;

  @Field()
  category!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  currentValue?: string;

  @Field({ nullable: true })
  suggestedValue?: string;

  @Field()
  rationale!: string;

  @Field()
  confidence!: string;
}

@ObjectType()
export class PublishReadinessReview {
  @Field()
  provider!: string;

  @Field()
  model!: string;

  @Field()
  summary!: string;

  @Field(() => [PublishReadinessReviewSuggestion])
  suggestions!: PublishReadinessReviewSuggestion[];

  @Field(() => [String])
  warnings!: string[];
}
```

- [ ] **Step 4: Implement strict parser**

Create `libs/ai/api/src/lib/publish-readiness-review.parser.ts`:

```ts
import { BadRequestException } from '@nestjs/common';

import type {
  PublishReadinessReview,
  PublishReadinessReviewSuggestion,
} from './publish-readiness-review.model';

const CATEGORIES = new Set(['lead', 'seo-social', 'aeo-geo', 'editorial-risk']);
const CONFIDENCE = new Set(['low', 'medium', 'high']);

export function parsePublishReadinessReview(
  response: string
): Omit<PublishReadinessReview, 'provider' | 'model'> {
  let data: unknown;

  try {
    data = JSON.parse(response);
  } catch {
    throw new BadRequestException('AI review returned invalid JSON.');
  }

  if (!isObject(data) || typeof data.summary !== 'string') {
    throw new BadRequestException('AI review returned an invalid summary.');
  }

  if (!Array.isArray(data.suggestions) || !Array.isArray(data.warnings)) {
    throw new BadRequestException('AI review returned an invalid shape.');
  }

  return {
    summary: data.summary,
    suggestions: data.suggestions.map(parseSuggestion),
    warnings: data.warnings.filter((warning): warning is string => {
      return typeof warning === 'string' && warning.trim().length > 0;
    }),
  };
}

function parseSuggestion(value: unknown): PublishReadinessReviewSuggestion {
  if (!isObject(value)) {
    throw new BadRequestException('AI review returned an invalid suggestion.');
  }

  const { id, category, title, currentValue, suggestedValue, rationale, confidence } =
    value;

  if (
    typeof id !== 'string' ||
    typeof category !== 'string' ||
    !CATEGORIES.has(category) ||
    typeof title !== 'string' ||
    typeof rationale !== 'string' ||
    typeof confidence !== 'string' ||
    !CONFIDENCE.has(confidence)
  ) {
    throw new BadRequestException('AI review returned an invalid suggestion.');
  }

  return {
    id,
    category,
    title,
    currentValue: typeof currentValue === 'string' ? currentValue : undefined,
    suggestedValue:
      typeof suggestedValue === 'string' ? suggestedValue : undefined,
    rationale,
    confidence,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
```

- [ ] **Step 5: Run parser tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-api --runInBand --testFile=libs/ai/api/src/lib/publish-readiness-review.parser.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add libs/ai/api/src/lib/publish-readiness-review.model.ts libs/ai/api/src/lib/publish-readiness-review.parser.ts libs/ai/api/src/lib/publish-readiness-review.parser.spec.ts
git commit -m "feat(ai-api): parse publish readiness reviews"
```

## Task 6: Add Provider Abstraction With V0 And Ollama Paths

**Files:**
- Create: `libs/ai/api/src/lib/v0.config.ts`
- Modify: `libs/ai/api/src/lib/v0.resolver.ts`
- Create: `libs/ai/api/src/lib/publish-readiness-review.provider.ts`
- Create: `libs/ai/api/src/lib/publish-readiness-review.prompt.ts`
- Create: `libs/ai/api/src/lib/providers/v0-publish-readiness.provider.ts`
- Create: `libs/ai/api/src/lib/providers/ollama-publish-readiness.provider.ts`
- Create: `libs/ai/api/src/lib/publish-readiness-review.service.ts`
- Create: `libs/ai/api/src/lib/publish-readiness-review.service.spec.ts`

- [ ] **Step 1: Write service tests with mocked providers**

Create `libs/ai/api/src/lib/publish-readiness-review.service.spec.ts` with tests that instantiate `PublishReadinessReviewService` using fake providers:

```ts
import { BadRequestException } from '@nestjs/common';

import { PublishReadinessReviewService } from './publish-readiness-review.service';
import type { PublishReadinessReviewProvider } from './publish-readiness-review.provider';
import type { PublishReadinessReviewInput } from './publish-readiness-review.model';

const input = {
  contentType: 'article',
  metadata: {
    title: 'Zurich presents climate plan for 2026',
    authors: ['Lina Meier'],
    tags: ['climate'],
    hasImage: true,
    hidden: false,
    hideAuthor: false,
  },
  deterministicStatus: 'review',
  deterministicScore: 74,
  deterministicChecks: [
    { id: 'opening-context-signals', category: 'aeo', status: 'warning' },
  ],
  signals: {
    text: 'Zurich officials said the plan affects residents.',
    firstParagraph: 'Zurich officials said the plan affects residents.',
    headingCount: 1,
    listCount: 0,
    sourceLinks: ['https://example.com/source'],
    imageCount: 1,
    captionCount: 1,
  },
} satisfies PublishReadinessReviewInput;

describe('PublishReadinessReviewService', () => {
  it('returns parsed provider suggestions with provider metadata', async () => {
    const provider: PublishReadinessReviewProvider = {
      name: 'test',
      model: 'fixture',
      review: jest.fn().mockResolvedValue(
        JSON.stringify({
          summary: 'Move the answer earlier.',
          suggestions: [
            {
              id: 'lead-1',
              category: 'lead',
              title: 'Lead with the answer',
              suggestedValue: 'Zurich plans climate measures for 2026.',
              rationale: 'The deterministic AEO signal is weak.',
              confidence: 'medium',
            },
          ],
          warnings: [],
        })
      ),
    };

    const service = new PublishReadinessReviewService(provider);
    const result = await service.review(input);

    expect(result.provider).toBe('test');
    expect(result.model).toBe('fixture');
    expect(result.suggestions[0].category).toBe('lead');
  });

  it('rejects invalid provider output', async () => {
    const provider: PublishReadinessReviewProvider = {
      name: 'test',
      model: 'fixture',
      review: jest.fn().mockResolvedValue('<p>HTML</p>'),
    };

    const service = new PublishReadinessReviewService(provider);

    await expect(service.review(input)).rejects.toThrow(BadRequestException);
  });
});
```

- [ ] **Step 2: Run service tests to verify they fail**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-api --runInBand --testFile=libs/ai/api/src/lib/publish-readiness-review.service.spec.ts
```

Expected: FAIL because the provider/service files do not exist.

- [ ] **Step 3: Extract V0 config**

Move the `V0Settings` type and `V0Config` class from `libs/ai/api/src/lib/v0.resolver.ts` into `libs/ai/api/src/lib/v0.config.ts`, export both, and import `V0Config` in `v0.resolver.ts`.

The new file must preserve:

```ts
export type V0Settings = { apiKey: string | null; systemPrompt: string | null };
```

and the existing `getV0()`, `apiKey()`, and `systemPrompt()` behavior.

- [ ] **Step 4: Add provider interface and prompt builder**

Create `libs/ai/api/src/lib/publish-readiness-review.provider.ts`:

```ts
import type { PublishReadinessReviewInput } from './publish-readiness-review.model';

export interface PublishReadinessReviewProvider {
  readonly name: string;
  readonly model: string;
  review(input: PublishReadinessReviewInput, prompt: string): Promise<string>;
}
```

Create `libs/ai/api/src/lib/publish-readiness-review.prompt.ts`:

```ts
import type { PublishReadinessReviewInput } from './publish-readiness-review.model';

export function buildPublishReadinessReviewPrompt(
  input: PublishReadinessReviewInput
): string {
  return [
    'You are assisting an editor before publication.',
    'Use deterministic checks as input signals, not final truth.',
    'Do not claim search ranking, citation probability, factual correctness, legal certainty, or medical certainty.',
    'Return only compact JSON with keys summary, suggestions, warnings.',
    'Suggestion categories must be lead, seo-social, aeo-geo, or editorial-risk.',
    'Confidence must be low, medium, or high.',
    'Review context:',
    JSON.stringify(input),
  ].join('\n');
}
```

- [ ] **Step 5: Add provider adapters**

Create `libs/ai/api/src/lib/providers/ollama-publish-readiness.provider.ts`:

```ts
import type { PublishReadinessReviewInput } from '../publish-readiness-review.model';
import type { PublishReadinessReviewProvider } from '../publish-readiness-review.provider';

export class OllamaPublishReadinessProvider
  implements PublishReadinessReviewProvider
{
  readonly name = 'ollama';

  constructor(
    private readonly host = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434',
    readonly model = process.env.OLLAMA_MODEL ?? 'gpt-oss:20b-cloud'
  ) {}

  async review(
    _input: PublishReadinessReviewInput,
    prompt: string
  ): Promise<string> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama review failed with ${response.status}`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    return data.message?.content ?? data.response ?? '';
  }
}
```

Create `libs/ai/api/src/lib/providers/v0-publish-readiness.provider.ts`:

```ts
import { ChatsCreateResponse, createClient } from 'v0-sdk';
import { PrismaClient } from '@prisma/client';
import { KvTtlCacheService } from '@wepublish/kv-ttl-cache/api';

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
  const candidates = chat.messages.flatMap(message => {
    return (
      message.experimental_content?.flatMap(content => {
        const [, payload, fallback] = content;

        if (typeof fallback === 'string') return [fallback];

        if (Array.isArray(payload)) {
          return payload.flatMap(entry => {
            if (!Array.isArray(entry)) return [];
            const value = entry[2];
            return typeof value === 'string' ? [value] : [];
          });
        }

        return [];
      }) ?? []
    );
  });

  return (
    candidates
      .map(candidate => candidate.trim())
      .find(candidate => candidate.startsWith('{') && candidate.endsWith('}')) ??
    candidates.map(candidate => candidate.trim()).find(Boolean) ??
    ''
  );
}
```

- [ ] **Step 6: Implement service and provider selection**

Create `libs/ai/api/src/lib/publish-readiness-review.service.ts`:

```ts
import { Injectable } from '@nestjs/common';

import type {
  PublishReadinessReview,
  PublishReadinessReviewInput,
} from './publish-readiness-review.model';
import { parsePublishReadinessReview } from './publish-readiness-review.parser';
import type { PublishReadinessReviewProvider } from './publish-readiness-review.provider';
import { buildPublishReadinessReviewPrompt } from './publish-readiness-review.prompt';

@Injectable()
export class PublishReadinessReviewService {
  constructor(private readonly provider: PublishReadinessReviewProvider) {}

  async review(
    input: PublishReadinessReviewInput
  ): Promise<PublishReadinessReview> {
    const raw = await this.provider.review(
      input,
      buildPublishReadinessReviewPrompt(input)
    );
    const parsed = parsePublishReadinessReview(raw);

    return {
      provider: this.provider.name,
      model: this.provider.model,
      ...parsed,
    };
  }
}
```

Wire provider creation in the module in Task 7, not inside this service.

- [ ] **Step 7: Run backend service tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-api --runInBand --testFile=libs/ai/api/src/lib/publish-readiness-review.service.spec.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add libs/ai/api/src/lib/v0.config.ts libs/ai/api/src/lib/v0.resolver.ts libs/ai/api/src/lib/publish-readiness-review.provider.ts libs/ai/api/src/lib/publish-readiness-review.prompt.ts libs/ai/api/src/lib/providers/v0-publish-readiness.provider.ts libs/ai/api/src/lib/providers/ollama-publish-readiness.provider.ts libs/ai/api/src/lib/publish-readiness-review.service.ts libs/ai/api/src/lib/publish-readiness-review.service.spec.ts
git commit -m "feat(ai-api): add publish readiness review providers"
```

## Task 7: Add GraphQL Mutation And Generated Editor Hook

**Files:**
- Create: `libs/ai/api/src/lib/publish-readiness-review.resolver.ts`
- Modify: `libs/ai/api/src/lib/v0.module.ts`
- Modify: `libs/ai/api/src/index.ts`
- Create: `libs/editor/api/src/lib/schemas/publish-readiness-review.graphql`
- Generated: `apps/api-example/schema-v2.graphql`
- Generated: `libs/editor/api/src/lib/graphql.ts`
- Generated if touched: `libs/testing/src/graphql/graphql-public.ts`, `libs/website/api/src/lib/graphql.ts`

- [ ] **Step 1: Add resolver**

Create `libs/ai/api/src/lib/publish-readiness-review.resolver.ts`:

```ts
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CanCreateArticle, CanCreatePage } from '@wepublish/permissions';
import { Permissions } from '@wepublish/permissions/api';

import {
  PublishReadinessReview,
  PublishReadinessReviewInput,
} from './publish-readiness-review.model';
import { PublishReadinessReviewService } from './publish-readiness-review.service';

@Resolver()
export class PublishReadinessReviewResolver {
  constructor(
    private readonly reviewService: PublishReadinessReviewService
  ) {}

  @Permissions(CanCreateArticle, CanCreatePage)
  @Mutation(() => PublishReadinessReview)
  reviewPublishReadiness(
    @Args('input') input: PublishReadinessReviewInput
  ): Promise<PublishReadinessReview> {
    return this.reviewService.review(input);
  }
}
```

- [ ] **Step 2: Wire module providers**

Modify `libs/ai/api/src/lib/v0.module.ts` so it provides:

```ts
providers: [
  V0Resolver,
  PublishReadinessReviewResolver,
  {
    provide: PublishReadinessReviewService,
    inject: [PrismaClient, KvTtlCacheService],
    useFactory: (prisma: PrismaClient, kv: KvTtlCacheService) => {
      const provider =
        process.env.PUBLISH_READINESS_REVIEW_PROVIDER === 'ollama' ?
          new OllamaPublishReadinessProvider()
        : new V0PublishReadinessProvider(prisma, kv);

      return new PublishReadinessReviewService(provider);
    },
  },
],
exports: [V0Resolver, PublishReadinessReviewResolver, PublishReadinessReviewService],
```

Import `PrismaClient`, `KvTtlCacheService`, `OllamaPublishReadinessProvider`, `V0PublishReadinessProvider`, `PublishReadinessReviewResolver`, and `PublishReadinessReviewService`.

- [ ] **Step 3: Export API symbols**

Append to `libs/ai/api/src/index.ts`:

```ts
export * from './lib/publish-readiness-review.model';
export * from './lib/publish-readiness-review.resolver';
export * from './lib/publish-readiness-review.service';
```

- [ ] **Step 4: Add editor GraphQL document**

Create `libs/editor/api/src/lib/schemas/publish-readiness-review.graphql`:

```graphql
mutation ReviewPublishReadiness($input: PublishReadinessReviewInput!) {
  reviewPublishReadiness(input: $input) {
    provider
    model
    summary
    suggestions {
      id
      category
      title
      currentValue
      suggestedValue
      rationale
      confidence
    }
    warnings
  }
}
```

- [ ] **Step 5: Regenerate schema and API types**

Run the API once to refresh `apps/api-example/schema-v2.graphql`. Use the smallest API-only command and stop it after schema generation:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH CONFIG_FILE_PATH=apps/api-example/src/default.yaml npx nx serve api-example
```

Expected: the server starts and writes `apps/api-example/schema-v2.graphql` in development mode. Stop it with `Ctrl+C` after the schema file timestamp changes.

Then run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npm run generate-api
```

Expected: generated editor GraphQL types include `useReviewPublishReadinessMutation`.

- [ ] **Step 6: Run focused backend/API checks**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-api --runInBand
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx lint ai-api
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add libs/ai/api/src/index.ts libs/ai/api/src/lib/v0.module.ts libs/ai/api/src/lib/publish-readiness-review.resolver.ts libs/editor/api/src/lib/schemas/publish-readiness-review.graphql apps/api-example/schema-v2.graphql libs/editor/api/src/lib/graphql.ts libs/testing/src/graphql/graphql-public.ts libs/website/api/src/lib/graphql.ts
git commit -m "feat(ai-api): expose publish readiness review mutation"
```

Before committing, run `git status --short` and add every generated GraphQL file that appears as modified from the codegen command. Do not add unrelated untracked `apps/*/tsconfig.tsbuildinfo` files.

## Task 8: Add AI-Enabled Publish Readiness Container

**Files:**
- Create: `libs/ui/editor/src/lib/panel/publishReadinessPanelWithAI.tsx`
- Modify: `libs/ui/editor/src/lib/panel/publishArticlePanel.tsx`
- Modify: `libs/ui/editor/src/lib/panel/publishPagePanel.tsx`
- Modify: `libs/ui/editor/src/lib/panel/index.ts`
- Test: `libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx`

- [ ] **Step 1: Write failing test for generated-hook mapping**

Append to `publishReadinessPanel.spec.tsx`:

```tsx
jest.mock('@wepublish/editor/api', () => ({
  ...jest.requireActual('@wepublish/editor/api'),
  getApiClientV2: jest.fn(() => undefined),
  useReviewPublishReadinessMutation: jest.fn(() => [
    jest.fn(),
    { loading: false, error: undefined, data: undefined },
  ]),
}));

it('renders AI-enabled readiness container with ready AI state', () => {
  render(
    <PublishReadinessPanelWithAI
      input={{
        type: 'page',
        metadata: {
          slug: 'about',
          title: 'About this newsroom',
          description: 'A concise page about this newsroom and its mission.',
          tags: ['about'],
          hidden: false,
        },
      }}
    />
  );

  expect(screen.getByText('Publish Intelligence')).toBeInTheDocument();
  expect(screen.getByLabelText('AI review')).toBeInTheDocument();
});
```

Import `PublishReadinessPanelWithAI` at the top of the spec.

- [ ] **Step 2: Run UI test to verify it fails**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx
```

Expected: FAIL because the container does not exist.

- [ ] **Step 3: Implement the container**

Create `libs/ui/editor/src/lib/panel/publishReadinessPanelWithAI.tsx`:

```tsx
import {
  getApiClientV2,
  useReviewPublishReadinessMutation,
} from '@wepublish/editor/api';
import { useCallback, useMemo, useState } from 'react';

import type { PublishReadinessAIReviewController } from '@wepublish/ai/editor';
import type { PublishReadinessInput } from './publishReadiness';
import { getPublishReadiness } from './publishReadiness';
import { PublishReadinessPanel } from './publishReadinessPanel';
import { getPublishReadinessReviewContext } from './publishReadinessReviewContext';

export function PublishReadinessPanelWithAI({
  input,
}: {
  readonly input: PublishReadinessInput;
}) {
  const readiness = useMemo(() => getPublishReadiness(input), [input]);
  const context = useMemo(
    () => getPublishReadinessReviewContext(input, readiness),
    [input, readiness]
  );
  const [reviewPublishReadiness, review] = useReviewPublishReadinessMutation({
    client: getApiClientV2(),
  });
  const [hasRequestedReview, setHasRequestedReview] = useState(false);

  const onReview = useCallback(async () => {
    setHasRequestedReview(true);
    await reviewPublishReadiness({
      variables: {
        input: context,
      },
    });
  }, [context, reviewPublishReadiness]);

  const aiReview: PublishReadinessAIReviewController = review.loading
    ? { state: 'loading', onReview }
    : review.error
      ? { state: 'error', message: review.error.message, onReview }
      : review.data?.reviewPublishReadiness
        ? {
            state: 'suggestions',
            summary: review.data.reviewPublishReadiness.summary,
            suggestions: review.data.reviewPublishReadiness.suggestions,
            warnings: review.data.reviewPublishReadiness.warnings,
            onReview,
          }
        : {
            state: hasRequestedReview ? 'error' : 'ready',
            message:
              hasRequestedReview ?
                'AI review returned no suggestions. Deterministic checks remain available.'
              : undefined,
            onReview,
          };

  return (
    <PublishReadinessPanel
      input={input}
      result={readiness}
      aiReview={aiReview}
    />
  );
}
```

- [ ] **Step 4: Use the AI-enabled container in publish modals**

In `publishArticlePanel.tsx`, replace:

```ts
import { PublishReadinessPanel } from './publishReadinessPanel';
```

with:

```ts
import { PublishReadinessPanelWithAI } from './publishReadinessPanelWithAI';
```

Replace `<PublishReadinessPanel input={{ ... }} />` with `<PublishReadinessPanelWithAI input={{ ... }} />`.

Make the same import and JSX replacement in `publishPagePanel.tsx`.

- [ ] **Step 5: Export the container**

Add this export to `libs/ui/editor/src/lib/panel/index.ts`:

```ts
export * from './publishReadinessPanelWithAI';
```

- [ ] **Step 6: Run UI tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add libs/ui/editor/src/lib/panel/publishReadinessPanelWithAI.tsx libs/ui/editor/src/lib/panel/publishArticlePanel.tsx libs/ui/editor/src/lib/panel/publishPagePanel.tsx libs/ui/editor/src/lib/panel/index.ts libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx
git commit -m "feat(editor): wire AI review into publish modals"
```

## Task 9: Add Local Ollama Cloud Proof Path

**Files:**
- Modify: `docs/superpowers/specs/2026-06-17-publish-intelligence-ai-review-design.md`
- Create: `docs/superpowers/proof/publish-intelligence-ai-review-local.md`

- [ ] **Step 1: Document the exact local free-provider path**

Create `docs/superpowers/proof/publish-intelligence-ai-review-local.md`:

```md
# Publish Intelligence AI Review Local Provider Proof

This proof path is for local development only. Production editor traffic still
uses WePublish GraphQL and server-side provider credentials.

## Ollama Cloud Free Path

1. Confirm the CLI exists:

   ```bash
   ollama --version
   ```

2. Sign in interactively if needed:

   ```bash
   ollama signin
   ```

3. Start or reuse the local Ollama server:

   ```bash
   ollama serve
   ```

4. In a separate shell, check that the cloud model is available:

   ```bash
   ollama run gpt-oss:20b-cloud "Return JSON: {\"summary\":\"ok\",\"suggestions\":[],\"warnings\":[]}"
   ```

5. Start the API with the local dev provider:

   ```bash
   PUBLISH_READINESS_REVIEW_PROVIDER=ollama OLLAMA_MODEL=gpt-oss:20b-cloud npm run watch:api-example
   ```

6. Run the editor and open an article/page publish modal. Click "Run AI review".

## Expected Result

The AI review lane returns suggestions or a clear provider error. The
deterministic publish score remains visible and unchanged.
```

- [ ] **Step 2: Add a short reference from the spec**

Append this line under the Provider Strategy section in the spec:

```md
The implementation proof path lives in `docs/superpowers/proof/publish-intelligence-ai-review-local.md`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-06-17-publish-intelligence-ai-review-design.md docs/superpowers/proof/publish-intelligence-ai-review-local.md
git commit -m "docs(editor): document local AI review proof"
```

## Task 10: Runtime Proof, Visual Proof, And Final Validation

**Files:**
- No source changes expected unless proof finds a real implementation defect.

- [ ] **Step 1: Run focused tests**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-editor --runInBand
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ui-editor --runInBand --testFile=libs/ui/editor/src/lib/panel/publishReadiness.spec.ts --testFile=libs/ui/editor/src/lib/panel/publishReadinessPanel.spec.tsx --testFile=libs/ui/editor/src/lib/panel/publishReadinessReviewContext.spec.ts
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx test ai-api --runInBand
```

Expected: all listed tests PASS.

- [ ] **Step 2: Run focused lint**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx lint ai-editor
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx lint ai-api
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx lint ui-editor
```

Expected: no new errors. Existing unrelated warnings must be recorded, not hidden.

- [ ] **Step 3: Run generated API check**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npm run generate-api
git diff --exit-code libs/editor/api/src/lib/graphql.ts
```

Expected: `generate-api` exits 0 and the generated editor API file has no uncommitted drift after the committed codegen output.

- [ ] **Step 4: Run browser or Storybook proof**

Use the existing WePublish Storybook/editor proof path from v1. Capture screenshots outside the repo, preferably under:

```bash
/home/void/CodexScreenshots/wepublish-publish-intelligence-ai-review/
```

Capture at least:

- deterministic review with AI ready state
- loading state
- suggestions state
- provider error state
- mobile-width layout

Expected: no text overlap, AI output labelled as suggestions, readable contrast, deterministic score still visible.

- [ ] **Step 5: Stop owned processes**

Run:

```bash
PATH=/home/void/.nvm/versions/node/v22.20.0/bin:$PATH npx nx daemon --stop
ps -eo pid,ppid,pmem,rss,comm,args | rg '/home/void/ExternalRepos/wepublish|wepublish/node_modules/nx/src/daemon|storybook dev|nx serve|next dev.*4200' | rg -v 'rg /home|exec_command|codex' || true
```

Expected: no WePublish helper processes remain unless the user asked to keep a server open.

- [ ] **Step 6: Final commit if proof changed files**

When proof fixes source files, commit the concrete files listed by `git status --short`:

```bash
git add path/to/fixed-file.ts path/to/fixed-file.tsx
git commit -m "fix(editor): polish publish readiness AI review"
```

Replace the example paths with the actual source files fixed during proof. If proof did not change source files, do not create an empty commit.

## Completion Criteria

- Deterministic v1 readiness score and tests still pass.
- AI review is manual, optional, and visually separate from deterministic checks.
- The backend mutation returns structured suggestions through a provider adapter.
- Invalid AI responses are rejected before reaching the UI.
- Local Ollama Cloud proof path is documented and can be attempted without committing credentials.
- Focused tests, lint, codegen, and visual proof are recorded honestly.
- No GitHub-facing action is taken without fresh user approval.
