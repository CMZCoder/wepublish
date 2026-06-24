import type { PublishReadinessReviewInput } from './publish-readiness-review.model';

const MAX_TEXT_LENGTH = 1800;
const MAX_FIRST_PARAGRAPH_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 320;

export function buildPublishReadinessReviewPrompt(
  input: PublishReadinessReviewInput
): string {
  return [
    'Assist an editor before publication.',
    'Use deterministic checks as input signals, not final truth.',
    'Do not claim search ranking, citation probability, factual correctness, legal certainty, or medical certainty.',
    'Return minified JSON only with keys summary, suggestions, warnings.',
    'Do not use markdown fences, prose before JSON, or prose after JSON.',
    'Use at most 2 suggestions and at most 1 warning.',
    'Suggestion categories must be lead, seo-social, aeo-geo, or editorial-risk.',
    'Confidence must be low, medium, or high.',
    'Each suggestion must include id, category, title, rationale, and confidence.',
    'Keep summary, title, rationale, and warnings short.',
    'Use warnings only for things a human should verify before publishing.',
    'Context:',
    JSON.stringify(buildPublishReadinessReviewContext(input)),
  ].join('\n');
}

function buildPublishReadinessReviewContext(
  input: PublishReadinessReviewInput
) {
  return {
    type: input.contentType,
    status: input.deterministicStatus,
    score: input.deterministicScore,
    checks: input.deterministicChecks,
    title: input.metadata.title,
    lead: truncate(input.metadata.leadOrDescription, MAX_DESCRIPTION_LENGTH),
    seoTitle: input.metadata.seoTitle,
    socialTitle: input.metadata.socialMediaTitle,
    socialDescription: truncate(
      input.metadata.socialMediaDescription,
      MAX_DESCRIPTION_LENGTH
    ),
    slug: input.metadata.slug,
    url: input.metadata.url,
    canonicalUrl: input.metadata.canonicalUrl,
    authors: input.metadata.authors,
    tags: input.metadata.tags,
    hasImage: input.metadata.hasImage,
    hidden: input.metadata.hidden,
    hideAuthor: input.metadata.hideAuthor,
    publishedAt: input.metadata.publishedAt,
    text: truncate(input.signals.text, MAX_TEXT_LENGTH),
    firstParagraph: truncate(
      input.signals.firstParagraph,
      MAX_FIRST_PARAGRAPH_LENGTH
    ),
    headingCount: input.signals.headingCount,
    listCount: input.signals.listCount,
    sourceLinkCount: input.signals.sourceLinks.length,
    imageCount: input.signals.imageCount,
    captionCount: input.signals.captionCount,
  };
}

function truncate(
  value: string | null | undefined,
  maxLength: number
): string | null | undefined {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}
