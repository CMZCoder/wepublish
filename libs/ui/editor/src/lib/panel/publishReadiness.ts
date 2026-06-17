import { EditorBlockType } from '@wepublish/editor/api';
import { BlockFormat, InlineFormat } from '@wepublish/richtext';
import { Element, Node as SlateNode } from 'slate';

import { BlockValue, EmbedType } from '../blocks/types';

export type PublishReadinessContentType = 'article' | 'page';
export type PublishReadinessStatus = 'ready' | 'review' | 'risky';
export type PublishReadinessCheckStatus = 'pass' | 'warning' | 'risk';
export type PublishReadinessCategory =
  | 'editorial'
  | 'seo-social'
  | 'aeo'
  | 'geo';

export interface PublishReadinessMetadata {
  readonly slug?: string | null;
  readonly title?: string | null;
  readonly seoTitle?: string | null;
  readonly lead?: string | null;
  readonly description?: string | null;
  readonly authors?: ReadonlyArray<{ readonly name?: string | null } | null>;
  readonly tags?: readonly string[];
  readonly image?: { readonly filename?: string | null } | null;
  readonly socialMediaTitle?: string | null;
  readonly socialMediaDescription?: string | null;
  readonly socialMediaAuthors?: ReadonlyArray<{
    readonly name?: string | null;
  } | null>;
  readonly socialMediaImage?: { readonly filename?: string | null } | null;
  readonly paywall?: string | null;
  readonly hidden?: boolean | null;
  readonly hideAuthor?: boolean | null;
  readonly canonicalUrl?: string | null;
  readonly url?: string | null;
}

export interface PublishReadinessInput {
  readonly type: PublishReadinessContentType;
  readonly metadata: PublishReadinessMetadata;
  readonly blocks?: readonly BlockValue[];
  readonly publishedAt?: Date;
}

export interface PublishReadinessCheck {
  readonly id: string;
  readonly category: PublishReadinessCategory;
  readonly status: PublishReadinessCheckStatus;
}

export interface PublishReadinessResult {
  readonly status: PublishReadinessStatus;
  readonly score: number;
  readonly checks: PublishReadinessCheck[];
}

export interface PublishReadinessSignals {
  readonly text: string;
  readonly firstParagraph: string;
  readonly headingCount: number;
  readonly listCount: number;
  readonly sourceLinks: string[];
  readonly imageCount: number;
  readonly captionCount: number;
}

const MIN_TITLE_LENGTH = 12;
const MAX_SEO_TITLE_LENGTH = 70;
const MIN_SUMMARY_LENGTH = 50;
const MAX_SUMMARY_LENGTH = 180;
const MIN_OPENING_PARAGRAPH_LENGTH = 80;
const CLICKBAIT_PATTERNS = [
  /read more/i,
  /find out/i,
  /click here/i,
  /you won't believe/i,
];

export function getPublishReadiness({
  type,
  metadata,
  blocks = [],
  publishedAt,
}: PublishReadinessInput): PublishReadinessResult {
  const signals = getContentSignals(blocks);
  const title = text(metadata.seoTitle || metadata.title);
  const visibleTitle = text(metadata.title || metadata.seoTitle);
  const summary = text(
    type === 'article' ?
      metadata.socialMediaDescription || metadata.lead
    : metadata.socialMediaDescription || metadata.description
  );
  const hasImage =
    Boolean(metadata.socialMediaImage || metadata.image) ||
    signals.imageCount > 0;
  const hasSocialImage =
    Boolean(metadata.socialMediaImage || metadata.image) ||
    signals.imageCount > 0;
  const checks: PublishReadinessCheck[] = [
    check('slug', 'editorial', text(metadata.slug) ? 'pass' : 'risk'),
    check(
      'title',
      'editorial',
      visibleTitle.length >= MIN_TITLE_LENGTH ? 'pass' : 'risk'
    ),
    check(
      'summary',
      'editorial',
      summary.length >= MIN_SUMMARY_LENGTH ? 'pass' : 'risk'
    ),
    check('tags', 'editorial', metadata.tags?.length ? 'pass' : 'warning'),
    check('image', 'editorial', hasImage ? 'pass' : 'warning'),
    check('hidden', 'editorial', metadata.hidden ? 'warning' : 'pass'),
    check(
      'seo-title-length',
      'seo-social',
      title.length >= MIN_TITLE_LENGTH && title.length <= MAX_SEO_TITLE_LENGTH ?
        'pass'
      : 'warning'
    ),
    check(
      'description-length',
      'seo-social',
      (
        summary.length >= MIN_SUMMARY_LENGTH &&
          summary.length <= MAX_SUMMARY_LENGTH
      ) ?
        'pass'
      : 'warning'
    ),
    check('social-image', 'seo-social', hasSocialImage ? 'pass' : 'warning'),
    check(
      'canonical-url',
      'seo-social',
      getCanonicalUrlStatus(metadata.canonicalUrl)
    ),
    check(
      'opening-context-signals',
      'aeo',
      getOpeningContextStatus(signals.firstParagraph, visibleTitle, summary)
    ),
    check(
      'headings',
      'aeo',
      signals.headingCount > 0 || signals.listCount > 0 ? 'pass' : 'warning'
    ),
    check(
      'named-signals',
      'aeo',
      hasContextSignal(signals.text || `${visibleTitle} ${summary}`) ? 'pass'
      : 'warning'
    ),
    check('publish-date', 'geo', publishedAt ? 'pass' : 'warning'),
    check(
      'source-links',
      'geo',
      signals.sourceLinks.length > 0 ? 'pass' : 'warning'
    ),
    check(
      'image-context',
      'geo',
      getImageContextStatus(hasImage, signals.captionCount)
    ),
  ];

  if (type === 'article') {
    checks.splice(
      3,
      0,
      check(
        'visible-author',
        'geo',
        getVisibleAuthorStatus(metadata.authors, metadata.hideAuthor)
      )
    );
  }

  return scoreChecks(checks);
}

export function getPublishReadinessSignals(
  blocks: readonly BlockValue[] = []
): PublishReadinessSignals {
  return getContentSignals(blocks);
}

function check(
  id: string,
  category: PublishReadinessCategory,
  status: PublishReadinessCheckStatus
): PublishReadinessCheck {
  return { id, category, status };
}

function scoreChecks(checks: PublishReadinessCheck[]): PublishReadinessResult {
  const score = Math.round(
    (checks.reduce((sum, check) => {
      if (check.status === 'pass') return sum + 1;
      if (check.status === 'warning') return sum + 0.5;
      return sum;
    }, 0) /
      checks.length) *
      100
  );
  const risks = checks.filter(check => check.status === 'risk').length;
  const warnings = checks.filter(check => check.status === 'warning').length;
  const status: PublishReadinessStatus =
    risks >= 3 ? 'risky'
    : risks > 0 || warnings >= 3 ? 'review'
    : 'ready';

  return {
    status,
    score,
    checks,
  };
}

function getCanonicalUrlStatus(
  canonicalUrl: string | null | undefined
): PublishReadinessCheckStatus {
  const value = text(canonicalUrl);
  if (!value) return 'pass';
  return isHttpUrl(value) ? 'pass' : 'warning';
}

function getVisibleAuthorStatus(
  authors: PublishReadinessMetadata['authors'],
  hideAuthor: boolean | null | undefined
): PublishReadinessCheckStatus {
  if (!authors?.filter(Boolean).length) return 'risk';
  return hideAuthor ? 'warning' : 'pass';
}

function getOpeningContextStatus(
  firstParagraph: string,
  title: string,
  summary: string
): PublishReadinessCheckStatus {
  const paragraph = text(firstParagraph);
  if (paragraph.length < MIN_OPENING_PARAGRAPH_LENGTH) return 'warning';
  if (CLICKBAIT_PATTERNS.some(pattern => pattern.test(paragraph))) {
    return 'warning';
  }

  return (
      hasContextSignal(paragraph) ||
        hasKeywordOverlap(paragraph, `${title} ${summary}`)
    ) ?
      'pass'
    : 'warning';
}

function getImageContextStatus(
  hasImage: boolean,
  captionCount: number
): PublishReadinessCheckStatus {
  if (!hasImage) return 'warning';
  return captionCount > 0 ? 'pass' : 'warning';
}

function getContentSignals(
  blocks: readonly BlockValue[]
): PublishReadinessSignals {
  return blocks.reduce(
    (signals, block) => mergeSignals(signals, getBlockSignals(block)),
    emptySignals()
  );
}

function getBlockSignals(block: BlockValue): PublishReadinessSignals {
  switch (block.type) {
    case EditorBlockType.Title:
      return fromText(`${block.value.title} ${block.value.lead}`);
    case EditorBlockType.RichText:
      return getRichTextSignals(block.value.richText);
    case EditorBlockType.Image:
      return {
        ...fromText(block.value.caption),
        imageCount: block.value.image ? 1 : 0,
        captionCount: text(block.value.caption) ? 1 : 0,
      };
    case EditorBlockType.ImageGallery:
      return block.value.images.reduce((signals, image) => {
        return mergeSignals(signals, {
          ...fromText(image.caption),
          imageCount: image.image ? 1 : 0,
          captionCount: text(image.caption) ? 1 : 0,
        });
      }, emptySignals());
    case EditorBlockType.Listicle:
      return block.value.items.reduce((signals, item) => {
        const richTextSignals = getRichTextSignals(item.value.richText);
        return mergeSignals(signals, {
          ...richTextSignals,
          text: `${text(item.value.title)} ${richTextSignals.text}`.trim(),
          listCount: richTextSignals.listCount + 1,
          imageCount:
            item.value.image ?
              richTextSignals.imageCount + 1
            : richTextSignals.imageCount,
        });
      }, emptySignals());
    case EditorBlockType.Quote:
      return fromText(`${block.value.quote} ${block.value.author}`);
    case EditorBlockType.LinkPageBreak:
      return mergeSignals(getRichTextSignals(block.value.richText), {
        ...fromText(`${block.value.text} ${block.value.linkText}`),
        sourceLinks: block.value.linkURL ? [block.value.linkURL] : [],
        imageCount: block.value.image ? 1 : 0,
      });
    case EditorBlockType.Embed: {
      const embedUrl =
        block.value.type === EmbedType.Other ? text(block.value.url) : '';

      return {
        ...emptySignals(),
        sourceLinks: embedUrl ? [embedUrl] : [],
      };
    }
    case EditorBlockType.FlexBlock:
      return block.value.blocks.reduce((signals, child) => {
        return child.block ?
            mergeSignals(signals, getBlockSignals(child.block))
          : signals;
      }, emptySignals());
    case EditorBlockType.Html:
      return fromText(stripHtml(block.value.html));
    default:
      return emptySignals();
  }
}

function getRichTextSignals(nodes: SlateNode[]): PublishReadinessSignals {
  return nodes.reduce((signals, node) => {
    const text = SlateNode.string(node);
    const nodeSignals: PublishReadinessSignals = {
      text,
      firstParagraph:
        (
          !signals.firstParagraph &&
          Element.isElement(node) &&
          node.type === BlockFormat.Paragraph &&
          text.trim()
        ) ?
          text
        : '',
      headingCount:
        (
          Element.isElement(node) &&
          [BlockFormat.H1, BlockFormat.H2, BlockFormat.H3].includes(
            node.type as BlockFormat
          )
        ) ?
          1
        : 0,
      listCount:
        (
          Element.isElement(node) &&
          [BlockFormat.OrderedList, BlockFormat.UnorderedList].includes(
            node.type as BlockFormat
          )
        ) ?
          1
        : 0,
      sourceLinks: getLinks(node),
      imageCount: 0,
      captionCount: 0,
    };

    return mergeSignals(signals, nodeSignals);
  }, emptySignals());
}

function getLinks(node: SlateNode): string[] {
  const links: string[] = [];

  if (
    Element.isElement(node) &&
    node.type === InlineFormat.Link &&
    isHttpUrl(text(node.url))
  ) {
    links.push(text(node.url));
  }

  if (Element.isElement(node)) {
    for (const child of node.children) {
      links.push(...getLinks(child));
    }
  }

  return links;
}

function mergeSignals(
  left: PublishReadinessSignals,
  right: PublishReadinessSignals
): PublishReadinessSignals {
  return {
    text: `${left.text} ${right.text}`.trim(),
    firstParagraph: left.firstParagraph || right.firstParagraph,
    headingCount: left.headingCount + right.headingCount,
    listCount: left.listCount + right.listCount,
    sourceLinks: [...left.sourceLinks, ...right.sourceLinks],
    imageCount: left.imageCount + right.imageCount,
    captionCount: left.captionCount + right.captionCount,
  };
}

function emptySignals(): PublishReadinessSignals {
  return {
    text: '',
    firstParagraph: '',
    headingCount: 0,
    listCount: 0,
    sourceLinks: [],
    imageCount: 0,
    captionCount: 0,
  };
}

function fromText(value: string | null | undefined): PublishReadinessSignals {
  return {
    ...emptySignals(),
    text: text(value),
  };
}

function hasContextSignal(value: string): boolean {
  const normalized = text(value);
  return (
    /\b[A-Z][a-z]{2,}\b/.test(normalized) ||
    /\b\d{4}\b/.test(normalized) ||
    /\b\d+[.,]?\d*\b/.test(normalized)
  );
}

function hasKeywordOverlap(value: string, compareTo: string): boolean {
  const sourceWords = new Set(tokenize(value));
  return tokenize(compareTo).some(word => sourceWords.has(word));
}

function tokenize(value: string): string[] {
  return text(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length > 4);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function stripHtml(value: string | null | undefined): string {
  return text(value).replace(/<[^>]+>/g, ' ');
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}
