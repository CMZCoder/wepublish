import styled from '@emotion/styled';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import type { PublishReadinessAIReviewController } from '@wepublish/ai/editor';
import { Article } from '@wepublish/article/website';
import {
  mockArticle,
  mockArticleRevision,
  mockAuthor,
  mockImage,
  mockImageBlock,
  mockRichTextBlock,
  mockTag,
  mockTitleBlock,
} from '@wepublish/storybook/mocks';
import type {
  PublishReadinessInput,
  PublishReadinessResult,
} from '@wepublish/ui/editor';
import { PublishReadinessPanel } from '@wepublish/ui/editor';
import type {
  BlockContent,
  FullArticleFragment,
  FullImageFragment,
  FullPaywallFragment,
} from '@wepublish/website/api';
import type { Descendant } from 'slate';

import { theme as editorTheme } from './theme';

type PreviewVariant = 'article' | 'paywalled' | 'editor';

const previewCopy = {
  articleEditView: 'Article edit view with Publish Intelligence',
  articlePreviewDescription:
    'Actual WePublish Article, Paywall and PublishReadinessPanel components rendered together in a production-like Storybook surface.',
  author: 'Author',
  authorName: 'Lina Meier',
  editorDescription:
    'The article preview and intelligence rail are rendered with WePublish React components inside Storybook.',
  liveArticlePreview: 'Live article preview with editor rail',
  paywallAwarePreview: 'Paywall-aware article preview',
  preview: 'Preview',
  publish: 'Publish',
  saveDraft: 'Save draft',
  seoTitle: 'SEO title',
  slug: 'Slug',
  title: 'Title',
} as const;

const PreviewSurface = styled.div`
  background: #f7f9fb;
  min-height: 100vh;
  padding: 24px;
`;

const PreviewToolbar = styled.header`
  align-items: center;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  box-shadow: 0 18px 55px rgb(25 35 45 / 8%);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin: 0 auto 20px;
  max-width: 1440px;
  padding: 12px 14px;

  @media (max-width: 760px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const ToolbarTitle = styled.strong`
  color: ${({ theme }) => theme.palette.text.primary};
  display: block;
  font-size: 13px;
  line-height: 1.35;
`;

const ToolbarDescription = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: block;
  font-size: 12px;
  line-height: 1.45;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Action = styled.span<{ primary?: boolean }>`
  align-items: center;
  background: ${({ primary, theme }) =>
    primary ? theme.palette.primary.main : 'transparent'};
  border: 1px solid
    ${({ primary, theme }) =>
      primary ? theme.palette.primary.main : theme.palette.primary.dark};
  border-radius: 4px;
  color: ${({ primary, theme }) =>
    primary ? theme.palette.primary.contrastText : theme.palette.primary.dark};
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  justify-content: center;
  line-height: 1.2;
  min-height: 32px;
  padding: 8px 12px;
  white-space: nowrap;
`;

const PreviewGrid = styled.div`
  align-items: start;
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 460px);
  margin: 0 auto;
  max-width: 1440px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleFrame = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  overflow: hidden;
`;

const IntelligenceRail = styled.aside`
  display: grid;
  gap: 16px;
  position: sticky;
  top: 24px;

  @media (max-width: 1100px) {
    position: static;
  }
`;

const StoryFrame = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  box-shadow: 0 18px 55px rgb(25 35 45 / 12%);
  padding: 18px;
`;

const EditorWorkspace = styled.div`
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 460px);
  margin: 0 auto;
  max-width: 1440px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MetadataPanel = styled.section`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  display: grid;
  gap: 14px;
  padding: 18px;
`;

const MetadataGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const FieldLabel = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 12px;
  font-weight: 700;
`;

const FieldValue = styled.span`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 14px;
  min-height: 38px;
  padding: 9px 10px;
`;

const readinessInput: PublishReadinessInput = {
  type: 'article',
  publishedAt: new Date('2026-06-17T10:00:00.000Z'),
  metadata: {
    slug: 'zurich-climate-plan-2026',
    title: 'Zurich climate plan changes commuter routes in 2026',
    seoTitle: 'Zurich climate plan 2026: route changes for commuters',
    lead: 'Zurich plans new transport rules from 2026, affecting commuters, school routes and delivery windows.',
    authors: [{ name: 'Lina Meier' }],
    tags: ['climate', 'zurich', 'transport'],
    image: { filename: 'zurich-plan.jpg' },
    socialMediaTitle: 'Zurich climate plan 2026',
    socialMediaDescription:
      'What Zurich’s 2026 transport proposal changes, who is affected and where the city published the plan.',
    socialMediaImage: { filename: 'zurich-social.jpg' },
    hidden: false,
    hideAuthor: false,
    canonicalUrl: 'https://example.com/zurich-climate-plan-2026',
  },
};

const paywalledReadinessInput: PublishReadinessInput = {
  ...readinessInput,
  metadata: {
    ...readinessInput.metadata,
    paywall: 'member-reporting',
  },
};

const reviewResult: PublishReadinessResult = {
  status: 'review',
  score: 71,
  checks: [
    { id: 'slug', category: 'editorial', status: 'pass' },
    { id: 'title', category: 'editorial', status: 'pass' },
    { id: 'summary', category: 'editorial', status: 'pass' },
    { id: 'visible-author', category: 'geo', status: 'warning' },
    { id: 'tags', category: 'editorial', status: 'warning' },
    { id: 'image', category: 'editorial', status: 'pass' },
    { id: 'hidden', category: 'editorial', status: 'pass' },
    { id: 'seo-title-length', category: 'seo-social', status: 'warning' },
    { id: 'description-length', category: 'seo-social', status: 'pass' },
    { id: 'social-image', category: 'seo-social', status: 'pass' },
    { id: 'canonical-url', category: 'seo-social', status: 'pass' },
    { id: 'opening-context-signals', category: 'aeo', status: 'warning' },
    { id: 'headings', category: 'aeo', status: 'pass' },
    { id: 'named-signals', category: 'aeo', status: 'warning' },
    { id: 'publish-date', category: 'geo', status: 'pass' },
    { id: 'source-links', category: 'geo', status: 'warning' },
    { id: 'image-context', category: 'geo', status: 'pass' },
  ],
};

const readyResult: PublishReadinessResult = {
  ...reviewResult,
  status: 'ready',
  score: 94,
  checks: reviewResult.checks.map(check => ({
    ...check,
    status: check.id === 'source-links' ? 'warning' : 'pass',
  })),
};

const aiSuggestions: PublishReadinessAIReviewController = {
  state: 'suggestions',
  summary:
    'The piece is publishable, but the opening can answer the reader question sooner and the source trail can be clearer.',
  suggestions: [
    {
      id: 'lead-answer',
      category: 'lead',
      confidence: 'medium',
      title: 'Move the concrete answer into the first paragraph',
      currentValue:
        'The opening introduces the topic before explaining impact.',
      suggestedValue:
        'Zurich plans new transport rules from 2026, affecting commuters, school routes and delivery windows.',
      rationale:
        'An answer-first lead gives readers and answer engines a clear summary before the background.',
    },
    {
      id: 'seo-description',
      category: 'seo-social',
      confidence: 'high',
      title: 'Tighten the social description',
      suggestedValue:
        'What Zurich’s 2026 transport proposal changes, who is affected and where the city published the plan.',
      rationale:
        'The current metadata is present, but a more specific description improves scan value in search and social previews.',
    },
    {
      id: 'source-cue',
      category: 'aeo-geo',
      confidence: 'medium',
      title: 'Add a visible source cue near the quoted number',
      currentValue:
        '12,000 residents are mentioned without nearby attribution.',
      suggestedValue:
        'According to the city planning office, roughly 12,000 residents live inside the affected zone.',
      rationale:
        'Generative answer systems and readers benefit when factual claims carry nearby source context.',
    },
  ],
  warnings: [
    'Verify the resident count against the original city document before publishing.',
  ],
};

const aiReady: PublishReadinessAIReviewController = {
  state: 'ready',
};

function richText(...paragraphs: string[]): Descendant[] {
  return paragraphs.map(text => ({
    type: 'paragraph',
    children: [{ text }],
  })) as Descendant[];
}

function h2(text: string): Descendant {
  return {
    type: 'h2',
    children: [{ text }],
  } as Descendant;
}

const articleImage: FullImageFragment = {
  ...mockImage(),
  description: 'Zurich tram route crossing a city center street',
  source: 'City planning office',
  title: 'Zurich commuter route planning',
};

const author = mockAuthor({
  name: 'Lina Meier',
  jobTitle: 'City reporter',
});

const activePaywall: FullPaywallFragment = {
  __typename: 'Paywall',
  id: 'paywall-member-reporting',
  active: true,
  anyMemberPlan: false,
  name: 'Member-only reporting',
  description: richText(
    'Become a member to continue reading this investigation and support independent reporting.'
  ),
  circumventDescription: richText(
    'Thank you for supporting independent reporting. You can continue reading this member article.'
  ),
  alternativeSubscribeUrl: null,
  upgradeDescription: [],
  upgradeCircumventDescription: [],
  memberPlans: [],
  bypasses: [],
  fadeout: true,
  hideContentAfter: 3,
};

const articleBlocks: BlockContent[] = [
  mockTitleBlock({
    preTitle: 'City & climate',
    title: 'Zurich climate plan changes commuter routes in 2026',
    lead: 'Zurich plans new transport rules from 2026, affecting commuters, school routes and delivery windows.',
  }),
  mockImageBlock({
    image: articleImage,
    caption:
      'New route planning around Zurich central districts. Source: City planning office.',
  }),
  mockRichTextBlock({
    richText: richText(
      'Zurich plans new transport rules from 2026, affecting commuters, school routes and delivery windows in the city center. The proposal shifts private car access away from several dense residential streets during morning and evening peaks.',
      'According to the city planning office, roughly 12,000 residents live inside the affected zone. Public consultation remains open until September, with a council vote expected before the end of the year.'
    ),
  }),
  mockRichTextBlock({
    richText: [
      h2('What changes for commuters'),
      ...richText(
        'The largest changes are planned around school routes, delivery windows and tram connections. Commuters who cross the district by car would be redirected to outer routes, while public transport connections would keep their current priority.'
      ),
    ],
  }),
];

const paywalledBlocks: BlockContent[] = [
  ...articleBlocks,
  mockRichTextBlock({
    richText: [
      h2('What members get after the paywall'),
      ...richText(
        'The member section includes a street-by-street timetable, delivery-window exceptions and the full council schedule. This block is intentionally behind the active paywall in the preview.'
      ),
    ],
  }),
];

function createArticle({
  paywalled = false,
}: {
  paywalled?: boolean;
} = {}): FullArticleFragment {
  const article = mockArticle({
    slug: 'zurich-climate-plan-2026',
    publishedAt: new Date('2026-06-17T10:00:00.000Z').toISOString(),
    tags: [
      mockTag({ tag: 'climate', main: true }),
      mockTag({ tag: 'zurich' }),
      mockTag({ tag: 'transport' }),
    ],
    latest: mockArticleRevision({
      authors: [author],
      blocks: paywalled ? paywalledBlocks : articleBlocks,
      canonicalUrl: 'https://example.com/zurich-climate-plan-2026',
      image: articleImage,
      lead: readinessInput.metadata.lead,
      preTitle: 'City & climate',
      socialMediaDescription:
        readinessInput.metadata.socialMediaDescription ?? undefined,
      socialMediaImage: articleImage,
      socialMediaTitle: 'Zurich climate plan 2026',
      title: readinessInput.metadata.title,
    }),
  });

  return {
    ...article,
    paywall: paywalled ? activePaywall : null,
  };
}

function IntelligencePanel({
  paywalled = false,
  withAI = false,
}: {
  paywalled?: boolean;
  withAI?: boolean;
}) {
  return (
    <ThemeProvider theme={editorTheme}>
      <StoryFrame>
        <PublishReadinessPanel
          input={paywalled ? paywalledReadinessInput : readinessInput}
          result={paywalled ? readyResult : reviewResult}
          aiReview={withAI ? aiSuggestions : aiReady}
        />
      </StoryFrame>
    </ThemeProvider>
  );
}

function ArticlePreview({ paywalled = false }: { paywalled?: boolean }) {
  const article = createArticle({ paywalled });

  return (
    <ArticleFrame>
      <Article
        data={{ article }}
        showPaywall={paywalled}
        hideContent={paywalled}
      />
    </ArticleFrame>
  );
}

function MetadataPreview() {
  return (
    <MetadataPanel aria-label="Article metadata">
      <MetadataGrid>
        <Field>
          <FieldLabel>{previewCopy.title}</FieldLabel>
          <FieldValue>{readinessInput.metadata.title}</FieldValue>
        </Field>
        <Field>
          <FieldLabel>{previewCopy.slug}</FieldLabel>
          <FieldValue>{readinessInput.metadata.slug}</FieldValue>
        </Field>
        <Field>
          <FieldLabel>{previewCopy.seoTitle}</FieldLabel>
          <FieldValue>{readinessInput.metadata.seoTitle}</FieldValue>
        </Field>
        <Field>
          <FieldLabel>{previewCopy.author}</FieldLabel>
          <FieldValue>{previewCopy.authorName}</FieldValue>
        </Field>
      </MetadataGrid>
    </MetadataPanel>
  );
}

export function ExactWePublishPreview({
  variant = 'article',
}: {
  variant?: PreviewVariant;
}) {
  const paywalled = variant === 'paywalled';
  const editor = variant === 'editor';

  if (editor) {
    return (
      <PreviewSurface aria-label="Exact WePublish article preview">
        <CssBaseline />
        <PreviewToolbar>
          <div>
            <ToolbarTitle>{previewCopy.articleEditView}</ToolbarTitle>
            <ToolbarDescription>
              {previewCopy.editorDescription}
            </ToolbarDescription>
          </div>
          <ActionRow>
            <Action>{previewCopy.saveDraft}</Action>
            <Action primary>{previewCopy.publish}</Action>
          </ActionRow>
        </PreviewToolbar>

        <EditorWorkspace>
          <div>
            <MetadataPreview />
            <ArticlePreview />
          </div>
          <IntelligenceRail>
            <IntelligencePanel withAI />
          </IntelligenceRail>
        </EditorWorkspace>
      </PreviewSurface>
    );
  }

  return (
    <PreviewSurface aria-label="Exact WePublish article preview">
      <CssBaseline />
      <PreviewToolbar>
        <div>
          <ToolbarTitle>
            {paywalled ?
              previewCopy.paywallAwarePreview
            : previewCopy.liveArticlePreview}
          </ToolbarTitle>
          <ToolbarDescription>
            {previewCopy.articlePreviewDescription}
          </ToolbarDescription>
        </div>
        <ActionRow>
          <Action>{previewCopy.preview}</Action>
          <Action primary>{previewCopy.publish}</Action>
        </ActionRow>
      </PreviewToolbar>

      <PreviewGrid>
        <ArticlePreview paywalled={paywalled} />
        <IntelligenceRail>
          <IntelligencePanel
            paywalled={paywalled}
            withAI={paywalled}
          />
        </IntelligenceRail>
      </PreviewGrid>
    </PreviewSurface>
  );
}

export default {
  component: ExactWePublishPreview,
  title: 'Editor/Publish Intelligence Live Pages',
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<typeof ExactWePublishPreview>;

export const LiveArticle: StoryObj<typeof ExactWePublishPreview> = {
  args: {
    variant: 'article',
  },
};

export const PaywalledArticle: StoryObj<typeof ExactWePublishPreview> = {
  args: {
    variant: 'paywalled',
  },
};

export const EditorReviewWorkspace: StoryObj<typeof ExactWePublishPreview> = {
  args: {
    variant: 'editor',
  },
};
