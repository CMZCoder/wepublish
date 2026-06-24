import styled from '@emotion/styled';
import { css } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { PublishReadinessAIReviewController } from '@wepublish/ai/editor';
import type {
  PublishReadinessInput,
  PublishReadinessResult,
} from '@wepublish/ui/editor';
import { PublishReadinessPanel } from '@wepublish/ui/editor';
import type { GetStaticProps } from 'next';
import Head from 'next/head';

const publishedAt = '2026-06-23T10:00:00.000Z';

const story = {
  title: 'Zurich climate plan changes commuter routes in 2026',
  kicker: 'City & climate',
  lead: 'Zurich plans new transport rules from 2026, affecting commuters, school routes and delivery windows.',
  slug: 'zurich-climate-plan-2026',
  author: 'Lina Meier',
  authorRole: 'City reporter',
  image:
    'https://images.unsplash.com/photo-1635922532367-401fce66aa1b?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1400',
  imageAlt: 'Zurich tram on a tree-lined city street',
  caption:
    'Tram connections remain central to the route proposal. Source: City planning office.',
  tags: ['climate', 'zurich'],
  source: 'City planning office',
  paragraphs: [
    'Zurich plans new transport rules from 2026, affecting commuters, school routes and delivery windows in the city center. The proposal shifts private car access away from several dense residential streets during morning and evening peaks.',
    'According to the city planning office, roughly 12,000 residents live inside the affected zone. Public consultation remains open until September, with a council vote expected before the end of the year.',
  ],
  memberParagraph:
    'The largest changes are planned around school routes, delivery windows and tram connections. Commuters who cross the district by car would be redirected to outer routes, while public transport connections keep their current priority.',
};

const readinessInput: PublishReadinessInput = {
  type: 'article',
  publishedAt: new Date(publishedAt),
  metadata: {
    slug: story.slug,
    title: story.title,
    seoTitle: 'Zurich climate plan 2026: route changes for commuters',
    lead: story.lead,
    authors: [{ name: story.author }],
    tags: story.tags,
    image: { filename: 'zurich-plan.jpg' },
    socialMediaTitle: 'Zurich climate plan 2026',
    socialMediaDescription:
      'What Zurich’s 2026 transport proposal changes, who is affected and where the city published the plan.',
    socialMediaImage: { filename: 'zurich-social.jpg' },
    hidden: false,
    hideAuthor: false,
    canonicalUrl: 'https://example.com/zurich-climate-plan-2026',
    paywall: 'Member-only reporting',
  },
};

const readinessResult: PublishReadinessResult = {
  status: 'review',
  score: 78,
  checks: [
    { id: 'slug', category: 'editorial', status: 'pass' },
    { id: 'title', category: 'editorial', status: 'pass' },
    { id: 'summary', category: 'editorial', status: 'pass' },
    { id: 'visible-author', category: 'geo', status: 'pass' },
    { id: 'tags', category: 'editorial', status: 'pass' },
    { id: 'image', category: 'editorial', status: 'pass' },
    { id: 'hidden', category: 'editorial', status: 'pass' },
    { id: 'seo-title-length', category: 'seo-social', status: 'warning' },
    { id: 'description-length', category: 'seo-social', status: 'pass' },
    { id: 'social-image', category: 'seo-social', status: 'pass' },
    { id: 'canonical-url', category: 'seo-social', status: 'pass' },
    { id: 'opening-context-signals', category: 'aeo', status: 'warning' },
    { id: 'headings', category: 'aeo', status: 'pass' },
    { id: 'named-signals', category: 'aeo', status: 'pass' },
    { id: 'publish-date', category: 'geo', status: 'pass' },
    { id: 'source-links', category: 'geo', status: 'warning' },
    { id: 'image-context', category: 'geo', status: 'pass' },
  ],
};

const aiReview: PublishReadinessAIReviewController = {
  state: 'suggestions',
  summary:
    'Ready for a final editor pass once the source note and opening sentence are tightened.',
  suggestions: [
    {
      id: 'answer-first-lead',
      category: 'lead',
      confidence: 'medium',
      title: 'Move the answer closer to the first sentence',
      currentValue:
        'The opening explains the proposal before naming the affected reader groups.',
      suggestedValue:
        'Zurich commuters, schools and delivery services would face new route rules from 2026 under the city climate plan.',
      rationale:
        'Readers see the practical impact faster when the affected groups appear before the policy mechanics.',
    },
    {
      id: 'source-near-number',
      category: 'aeo-geo',
      confidence: 'medium',
      title: 'Place the source next to the resident count',
      currentValue:
        '12,000 residents are mentioned with the source in the same paragraph.',
      suggestedValue:
        'According to the city planning office, roughly 12,000 residents live inside the affected zone.',
      rationale:
        'Nearby attribution helps readers evaluate the claim and gives citation systems clearer evidence.',
    },
  ],
  warnings: [
    'Confirm the resident count against the city document before publication.',
  ],
};

const Desk = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3.5)};
`;

const DeskHeader = styled.header`
  align-items: end;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0.5, 0, 2.5)};

  ${({ theme }) => css`
    ${theme.breakpoints.up('md')} {
      grid-template-columns: minmax(0, 1fr) max-content;
    }
  `}
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 760px;
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 0.78rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
`;

const DeskTitle = styled.h1`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 2.65rem;
  line-height: 1.04;
  margin: 0;

  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      font-size: 2.15rem;
    }
  `}
`;

const DeskLead = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 1rem;
  line-height: 1.55;
  margin: 0;
`;

const StatusStack = styled.div`
  align-items: end;
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-items: start;

  ${({ theme }) => css`
    ${theme.breakpoints.up('md')} {
      justify-items: end;
    }
  `}
`;

const ScoreBadge = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => alpha(theme.palette.primary.main, 0.32)};
  border-radius: 999px;
  color: ${({ theme }) => theme.palette.primary.main};
  display: inline-flex;
  font-weight: 800;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.75, 1.25)};
`;

const MetaLine = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  margin: 0;
`;

const Workspace = styled.div`
  align-items: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};

  ${({ theme }) => css`
    ${theme.breakpoints.up('lg')} {
      grid-template-columns: minmax(0, 720px) minmax(360px, 1fr);
    }
  `}
`;

const StoryFrame = styled.article`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) =>
    `0 28px 80px ${alpha(theme.palette.common.black, 0.08)}`};
  min-width: 0;
  overflow: hidden;
`;

const ReaderToolbar = styled.div`
  align-items: center;
  background: ${({ theme }) => alpha(theme.palette.primary.main, 0.05)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
`;

const ToolbarTitle = styled.p`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
`;

const ToolbarPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Pill = styled.span<{ tone?: 'strong' | 'quiet' }>`
  border: 1px solid
    ${({ theme, tone }) =>
      tone === 'strong' ? theme.palette.primary.main : theme.palette.divider};
  border-radius: 999px;
  color: ${({ theme, tone }) =>
    tone === 'strong' ?
      theme.palette.primary.main
    : theme.palette.text.secondary};
  font-size: 0.78rem;
  font-weight: 800;
  padding: ${({ theme }) => theme.spacing(0.55, 1)};
`;

const StoryCanvas = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4.5)};

  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      padding: ${theme.spacing(3, 2.25)};
    }
  `}
`;

const StoryKicker = styled.p`
  background: ${({ theme }) => theme.palette.accent.light};
  color: ${({ theme }) => theme.palette.accent.contrastText};
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
  padding: ${({ theme }) => theme.spacing(0.45, 0.75)};
  width: fit-content;
`;

const StoryTitle = styled.h2`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 3rem;
  line-height: 1.06;
  margin: 0;
  max-width: 14ch;

  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      font-size: 2.35rem;
      max-width: 12ch;
    }
  `}
`;

const StoryLead = styled.p`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.28rem;
  line-height: 1.5;
  margin: 0;
  max-width: 32rem;
`;

const HeroFigure = styled.figure`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
`;

const HeroImage = styled.img`
  aspect-ratio: 16 / 9;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  display: block;
  object-fit: cover;
  width: 100%;
`;

const Caption = styled.figcaption`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.9rem;
  font-weight: 700;
`;

const StoryText = styled.div`
  color: ${({ theme }) => theme.palette.text.primary};
  display: grid;
  font-size: 1.09rem;
  gap: ${({ theme }) => theme.spacing(2)};
  line-height: 1.68;
  max-width: 35rem;

  p {
    margin: 0;
  }
`;

const InlineSuggestion = styled.aside`
  border-left: 3px solid ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.text.primary};
  display: grid;
  gap: ${({ theme }) => theme.spacing(0.75)};
  max-width: 35rem;
  padding: ${({ theme }) => theme.spacing(0.75, 0, 0.75, 2)};
`;

const SuggestionLabel = styled.p`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 0.78rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
`;

const SuggestionText = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.98rem;
  line-height: 1.55;
  margin: 0;
`;

const MemberGate = styled.div`
  border: 1px solid ${({ theme }) => alpha(theme.palette.primary.main, 0.28)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 35rem;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const GateLabel = styled.p`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 0.8rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
`;

const GateText = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  line-height: 1.55;
  margin: 0;
`;

const StoryFooter = styled.footer`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing(1.5)};
`;

const AuthorLine = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.9rem;
  margin: 0;

  strong {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const Rail = styled.aside`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;

  ${({ theme }) => css`
    ${theme.breakpoints.up('lg')} {
      position: sticky;
      top: ${theme.spacing(3)};
    }
  `}
`;

const RailHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  display: grid;
  gap: ${({ theme }) => theme.spacing(0.75)};
  padding-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const RailTitle = styled.h2`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.08rem;
  line-height: 1.2;
  margin: 0;
`;

const RailText = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.92rem;
  line-height: 1.45;
  margin: 0;
`;

export default function PublishIntelligencePreviewPage() {
  return (
    <>
      <Head>
        <title>Draft Review | We.Publish</title>
        <meta
          name="description"
          content="Draft review for a WePublish article before publication."
        />
      </Head>

      <Desk data-preview-kind="publish-intelligence">
        <DeskHeader>
          <HeaderCopy>
            <Eyebrow>Draft review</Eyebrow>
            <DeskTitle>{story.title}</DeskTitle>
            <DeskLead>
              Member article · {story.kicker} · Scheduled for 23 June 2026
            </DeskLead>
          </HeaderCopy>

          <StatusStack aria-label="Article readiness status">
            <ScoreBadge>78 score</ScoreBadge>
            <MetaLine>Needs review · 3 warnings before publish</MetaLine>
          </StatusStack>
        </DeskHeader>

        <Workspace>
          <StoryFrame aria-label="Article reader preview">
            <ReaderToolbar>
              <ToolbarTitle>Reader preview</ToolbarTitle>
              <ToolbarPills>
                <Pill tone="strong">Member article</Pill>
                <Pill>SEO ready</Pill>
                <Pill>AEO needs review</Pill>
              </ToolbarPills>
            </ReaderToolbar>

            <StoryCanvas>
              <StoryKicker>{story.kicker}</StoryKicker>
              <StoryTitle>{story.title}</StoryTitle>
              <StoryLead>{story.lead}</StoryLead>

              <HeroFigure>
                <HeroImage
                  alt={story.imageAlt}
                  src={story.image}
                />
                <Caption>{story.caption}</Caption>
              </HeroFigure>

              <StoryText>
                {story.paragraphs.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </StoryText>

              <InlineSuggestion aria-label="Inline editorial suggestion">
                <SuggestionLabel>Suggested edit</SuggestionLabel>
                <SuggestionText>
                  Move commuters, schools and delivery services into the first
                  sentence before explaining the policy mechanics.
                </SuggestionText>
              </InlineSuggestion>

              <MemberGate aria-label="Paywalled content marker">
                <GateLabel>Member section</GateLabel>
                <GateText>{story.memberParagraph}</GateText>
              </MemberGate>

              <StoryFooter>
                <AuthorLine>
                  Von <strong>{story.author}</strong> · {story.authorRole}
                </AuthorLine>
                <ToolbarPills>
                  {story.tags.map(tag => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </ToolbarPills>
              </StoryFooter>
            </StoryCanvas>
          </StoryFrame>

          <Rail aria-label="Publish intelligence panel">
            <RailHeader>
              <RailTitle>Publication checklist</RailTitle>
              <RailText>
                Three warnings need attention before this draft is ready.
              </RailText>
            </RailHeader>

            <PublishReadinessPanel
              input={readinessInput}
              result={readinessResult}
              aiReview={aiReview}
            />
          </Rail>
        </Workspace>
      </Desk>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {},
  revalidate: 60,
});
