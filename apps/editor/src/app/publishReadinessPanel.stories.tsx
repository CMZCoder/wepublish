import styled from '@emotion/styled';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import type { PublishReadinessAIReviewController } from '@wepublish/ai/editor';
import type { PublishReadinessResult } from '@wepublish/ui/editor';
import { PublishReadinessPanel } from '@wepublish/ui/editor';
import { CustomProvider } from 'rsuite';

import { theme } from './theme';

const StorySurface = styled.div`
  background: #f7f9fb;
  min-height: 100vh;
  padding: 24px;
`;

const StoryGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  max-width: 1120px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    max-width: 420px;
  }
`;

const StoryFrame = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  box-shadow: 0 18px 55px rgb(25 35 45 / 12%);
  padding: 18px;
`;

const readyResult: PublishReadinessResult = {
  status: 'ready',
  score: 94,
  checks: [
    { id: 'slug', category: 'editorial', status: 'pass' },
    { id: 'title', category: 'editorial', status: 'pass' },
    { id: 'summary', category: 'editorial', status: 'pass' },
    { id: 'visible-author', category: 'geo', status: 'pass' },
    { id: 'tags', category: 'editorial', status: 'pass' },
    { id: 'image', category: 'editorial', status: 'pass' },
    { id: 'hidden', category: 'editorial', status: 'pass' },
    { id: 'seo-title-length', category: 'seo-social', status: 'pass' },
    { id: 'description-length', category: 'seo-social', status: 'pass' },
    { id: 'social-image', category: 'seo-social', status: 'pass' },
    { id: 'canonical-url', category: 'seo-social', status: 'pass' },
    { id: 'opening-context-signals', category: 'aeo', status: 'pass' },
    { id: 'headings', category: 'aeo', status: 'pass' },
    { id: 'named-signals', category: 'aeo', status: 'pass' },
    { id: 'publish-date', category: 'geo', status: 'pass' },
    { id: 'source-links', category: 'geo', status: 'warning' },
    { id: 'image-context', category: 'geo', status: 'pass' },
  ],
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

const riskyResult: PublishReadinessResult = {
  status: 'risky',
  score: 38,
  checks: [
    { id: 'slug', category: 'editorial', status: 'risk' },
    { id: 'title', category: 'editorial', status: 'risk' },
    { id: 'summary', category: 'editorial', status: 'risk' },
    { id: 'tags', category: 'editorial', status: 'warning' },
    { id: 'image', category: 'editorial', status: 'warning' },
    { id: 'hidden', category: 'editorial', status: 'pass' },
    { id: 'seo-title-length', category: 'seo-social', status: 'warning' },
    { id: 'description-length', category: 'seo-social', status: 'warning' },
    { id: 'social-image', category: 'seo-social', status: 'warning' },
    { id: 'canonical-url', category: 'seo-social', status: 'pass' },
    { id: 'opening-context-signals', category: 'aeo', status: 'warning' },
    { id: 'headings', category: 'aeo', status: 'warning' },
    { id: 'named-signals', category: 'aeo', status: 'warning' },
    { id: 'publish-date', category: 'geo', status: 'warning' },
    { id: 'source-links', category: 'geo', status: 'warning' },
    { id: 'image-context', category: 'geo', status: 'warning' },
  ],
};

const aiReady: PublishReadinessAIReviewController = {
  state: 'ready',
};

const aiLoading: PublishReadinessAIReviewController = {
  state: 'loading',
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

const aiError: PublishReadinessAIReviewController = {
  state: 'error',
  message:
    'Local AI provider is unavailable. Deterministic checks remain available.',
};

const aiUnavailable: PublishReadinessAIReviewController = {
  state: 'unavailable',
  message: 'Configure an AI provider to run editorial suggestions.',
};

const renderStory = (
  result: PublishReadinessResult,
  aiReview?: PublishReadinessAIReviewController
) => (
  <ThemeProvider theme={theme}>
    <CustomProvider>
      <CssBaseline />
      <StorySurface>
        <StoryFrame>
          <PublishReadinessPanel
            result={result}
            aiReview={aiReview}
          />
        </StoryFrame>
      </StorySurface>
    </CustomProvider>
  </ThemeProvider>
);

export default {
  component: PublishReadinessPanel,
  title: 'Editor/Publish Intelligence',
  render: () => (
    <ThemeProvider theme={theme}>
      <CustomProvider>
        <CssBaseline />
        <StorySurface>
          <StoryGrid>
            <StoryFrame>
              <PublishReadinessPanel
                result={readyResult}
                aiReview={aiReady}
              />
            </StoryFrame>
            <StoryFrame>
              <PublishReadinessPanel
                result={reviewResult}
                aiReview={aiSuggestions}
              />
            </StoryFrame>
          </StoryGrid>
        </StorySurface>
      </CustomProvider>
    </ThemeProvider>
  ),
} as Meta<typeof PublishReadinessPanel>;

export const Overview: StoryObj<typeof PublishReadinessPanel> = {};

export const Ready: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(readyResult),
};

export const NeedsReview: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(reviewResult),
};

export const Risky: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(riskyResult),
};

export const AIReady: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(reviewResult, aiReady),
};

export const AIReviewing: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(reviewResult, aiLoading),
};

export const AISuggestions: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(reviewResult, aiSuggestions),
};

export const AIProviderError: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(reviewResult, aiError),
};

export const AIUnavailable: StoryObj<typeof PublishReadinessPanel> = {
  render: () => renderStory(reviewResult, aiUnavailable),
};
