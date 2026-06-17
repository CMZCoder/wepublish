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
    'Each suggestion must include id, category, title, rationale, and confidence.',
    'Use warnings only for things a human should verify before publishing.',
    'Review context:',
    JSON.stringify(input),
  ].join('\n');
}
