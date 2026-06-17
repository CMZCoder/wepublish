# Publish Intelligence Level 2: AI-Assisted Editorial Readiness

## Status

Design approved in principle by the user on 2026-06-17. This document is the
spec checkpoint before implementation planning. It describes the intended
direction, source constraints, and proof gates; it does not claim the feature is
implemented.

## Business Goal

WePublish editors already get deterministic publish-readiness signals in the
article and page publish modals. Level 2 should turn those signals into useful
editorial help: concise suggestions for improving the lead, metadata,
SEO/social preview, answer-oriented structure, and generative-search clarity.

The feature should make an editor faster and more confident before publishing,
without pretending that an algorithm or LLM can certify factual quality,
ranking, or citation likelihood.

## Current Source Observations

- `libs/ui/editor/src/lib/panel/publishReadiness.ts` computes the v1 score from
  observable metadata and block proxy signals only.
- `libs/ui/editor/src/lib/panel/publishReadinessPanel.tsx` displays the score,
  categories, risks, warnings, and a disclaimer that semantic quality still
  needs human or AI review.
- `libs/ui/editor/src/lib/panel/publishArticlePanel.tsx` and
  `libs/ui/editor/src/lib/panel/publishPagePanel.tsx` pass metadata, blocks, and
  publish date into the readiness panel.
- `libs/ai/api/src/lib/v0.resolver.ts` is currently focused on `promptHTML` and
  uses the `v0-sdk` to generate HTML for the HTML block editor.
- `libs/api/prisma/schema.prisma` currently defines `AIProviderType` with only
  `V0`, and `SettingAIProvider` stores `apiKey` and `systemPrompt`.
- `libs/ai/editor/src/index.ts` is empty, so shared editor AI UI components can
  be introduced there without displacing current product code.

## Design Choice

Use an **AI review lane beside the deterministic lane**.

The deterministic v1 meter remains the source of stable publish-readiness
status. The AI lane is optional, manually triggered, and presented as editorial
assistance. It may explain or prioritize deterministic findings, propose
rewrites, and suggest missing context, but it must not change the deterministic
score or automatically publish content.

This choice avoids a false promise that AI can validate semantic truth. It also
matches the existing modal flow: editors are already in a final review moment,
so suggestions are useful if they are concise and action-oriented.

## User Experience

The publish modal keeps the v1 `PublishReadinessPanel` as the first visible
signal. Under or inside that panel, Level 2 adds a compact AI section with these
states:

1. **Unavailable**: AI is not configured, or the current provider cannot support
   structured review. The UI explains that deterministic checks are still
   available.
2. **Ready**: an "AI review" action is available. It is manual, not automatic.
3. **Loading**: the request is running, with no modal lock unless the existing
   UI pattern requires it.
4. **Suggestions**: grouped advice appears as editable/copyable suggestions.
5. **Error**: provider errors, missing key errors, rate limits, and invalid AI
   responses are shown without breaking publishing.

Suggested sections:

- **Lead and answer summary**: propose a clearer opening answer and summary.
- **SEO and social preview**: propose title and description refinements.
- **AEO/GEO clarity**: suggest entities, dates, source cues, headings, and
  concise Q&A-shaped context.
- **Editorial risks**: list uncertain, missing, or unsupported signals that a
  human should inspect.

The UI must use existing WePublish editor patterns: React 18, Emotion styled
components, MUI theme values where the readiness panel already uses MUI, and
Apollo generated hooks for API calls. It should preserve accessibility and
contrast coverage added in v1.

## API Shape

Add a new structured GraphQL mutation instead of reusing `promptHTML`.

Proposed mutation:

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

The operation should accept bounded context only:

- content type
- relevant metadata fields
- extracted plain-text block signals
- deterministic checks and statuses
- optional locale/publication context

It should not send raw unnecessary internal data, user records, secret values,
or unrelated block payloads.

## Backend Boundary

Introduce a provider-neutral service in `libs/ai/api` for editorial review.
`V0Resolver` can keep owning HTML generation, but Level 2 should use a new
resolver/service pair, for example:

- `publish-readiness-review.model.ts`
- `publish-readiness-review.resolver.ts`
- `publish-readiness-review.service.ts`
- provider adapters under `libs/ai/api/src/lib/providers/`

The first implementation can support `V0` if the maintainers want to avoid a
Prisma enum migration. If we want Ollama Cloud or OpenRouter support inside the
WePublish app, the implementation must deliberately extend `AIProviderType`,
seed data, settings UI, and generated GraphQL types. That is a product-policy
choice, not a harmless frontend tweak.

## Provider Strategy

For local development and demonstration, the best free/low-friction candidates
are:

- **Ollama Cloud Free**: current docs say cloud models run through Ollama without
  a powerful local GPU, require `ollama signin`, and the Free plan includes
  access to cloud models. This machine has the `ollama` CLI installed, but it is
  not currently connected to a running Ollama instance.
- **OpenRouter Free Router**: current docs describe `openrouter/free` as an
  OpenAI-compatible router across free variants. The free tier has request
  limits, so it is suitable for demos and tests, not guaranteed sustained
  editorial use.
- **OpenCode**: current docs say OpenCode supports 75+ providers and local
  models. It is useful as a developer tool path, but it is not installed in this
  workspace and is not itself a WePublish app integration.

Implementation should keep provider keys server-side. The browser should call
WePublish GraphQL only.

The implementation proof path lives in
`docs/superpowers/proof/publish-intelligence-ai-review-local.md`.

References checked on 2026-06-17:

- https://docs.ollama.com/cloud
- https://ollama.com/pricing
- https://openrouter.ai/openrouter/free
- https://openrouter.ai/docs/api/reference/limits
- https://opencode.ai/docs/providers/

## Prompt And Response Contract

The backend prompt must explicitly state:

- Use the deterministic checks as input signals, not final truth.
- Do not claim search ranking, citation probability, factual correctness, or
  legal/medical certainty.
- Return only valid structured JSON matching the GraphQL response model.
- Keep suggestions concise and editor-actionable.
- Separate "rewrite suggestion" from "human should verify" warnings.

The response parser must reject malformed output and surface a safe error. The
UI should not render untrusted model HTML.

## Frontend Component Plan

Create reusable AI review UI in `libs/ai/editor` and compose it into
`PublishReadinessPanel`.

Recommended units:

- `PublishReadinessAIReview`: orchestrates action, loading, error, and result.
- `AIReviewSuggestionList`: displays grouped suggestions.
- `AIReviewUnavailable`: explains missing provider/configuration.
- Pure helpers for mapping deterministic checks into review request context.

The panel prop should stay backwards-compatible. A likely shape is:

```ts
interface PublishReadinessPanelProps {
  input?: PublishReadinessInput;
  result?: PublishReadinessResult;
  aiReview?: PublishReadinessAIReviewController;
}
```

This keeps v1 usable in tests and Storybook without a backend.

## Error Handling

- Missing provider key: show unavailable state.
- Rate limit or provider quota: show retry-safe error text.
- Timeout: show non-blocking error and keep deterministic checks visible.
- Invalid structured response: discard the response and show a safe error.
- Permission failure: hide or disable the AI action according to existing
  permission behavior.

Publishing remains possible if AI review fails, unless maintainers later choose
to make AI review an organization policy.

## Privacy And Safety

The first implementation should minimize data sent to the provider. The request
should use extracted plain text and metadata, not full raw editor state. Do not
include secrets, private user details, payment data, drafts from unrelated
content, or internal IDs unless they are required for the editor-facing result.

The UI should label AI output as suggestions. It must not present AI output as a
fact-check, ranking guarantee, or citation guarantee.

## Testing And Proof

Focused implementation proof should include:

- Unit tests for request-context extraction and response parsing.
- `ai-api` tests with mocked provider adapters for success, malformed output,
  missing provider, and rate-limit errors.
- `ui-editor` tests for unavailable, loading, suggestions, and error states.
- Existing publish-readiness tests to ensure v1 deterministic scoring is
  unchanged.
- GraphQL code generation after schema/doc changes.
- Storybook or browser proof of the panel states with contrast checks.
- Focused lint/type/test commands for touched projects.

No claim about GitHub CI being green should be made unless the fork CI is
checked after the branch is pushed. Repo-wide inherited CI/security failures
must be separated from Level 2 changes.

## Non-Goals

- Do not auto-publish content.
- Do not auto-rewrite article/page fields without explicit editor action.
- Do not claim deterministic checks understand semantic quality.
- Do not make `promptHTML` responsible for publish-readiness review.
- Do not add OpenCode as a production dependency.
- Do not add broad provider support without a deliberate settings/schema plan.

## Open Implementation Decision

The implementation can proceed in two honest stages:

1. **Frontend-first with mocked AI controller**: build the UI lane and component
   states using mock data and tests, then wire the backend after review.
2. **Full provider-backed path**: add the GraphQL operation, backend service,
   provider adapter, generated hooks, and UI integration in one branch.

The recommended path is stage 1 followed by stage 2. It gives visible frontend
value quickly while keeping provider and schema changes explicit.
