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
    readonly tags: readonly string[];
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
const MAX_FIRST_PARAGRAPH_LENGTH = 700;
const MAX_SOURCE_LINKS = 8;

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
      firstParagraph: truncate(
        signals.firstParagraph,
        MAX_FIRST_PARAGRAPH_LENGTH
      ),
      sourceLinks: signals.sourceLinks.slice(0, MAX_SOURCE_LINKS),
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
  return `${value.slice(0, maxLength - 3).trim()}...`;
}
