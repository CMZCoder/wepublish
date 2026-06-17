import styled from '@emotion/styled';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
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

const renderStory = (result: PublishReadinessResult) => (
  <ThemeProvider theme={theme}>
    <CustomProvider>
      <CssBaseline />
      <StorySurface>
        <StoryFrame>
          <PublishReadinessPanel result={result} />
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
              <PublishReadinessPanel result={readyResult} />
            </StoryFrame>
            <StoryFrame>
              <PublishReadinessPanel result={reviewResult} />
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
