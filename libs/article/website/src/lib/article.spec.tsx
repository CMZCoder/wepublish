import { render } from '@testing-library/react';
import * as stories from './article.stories';
import { composeStories } from '@storybook/react';
import { getArticleSEO } from './article-seo';
import {
  mockArticle,
  mockArticleRevision,
  mockBlockContent,
} from '@wepublish/storybook/mocks';
import { FullPaywallFragment } from '@wepublish/website/api';

const storiesCmp = composeStories(stories);

const activePaywall: FullPaywallFragment = {
  __typename: 'Paywall',
  id: 'paywall-1',
  active: true,
  anyMemberPlan: false,
  name: 'Member-only reporting',
  description: [],
  circumventDescription: [],
  alternativeSubscribeUrl: null,
  upgradeDescription: [],
  upgradeCircumventDescription: [],
  memberPlans: [],
  bypasses: [],
  fadeout: true,
  hideContentAfter: 3,
};

const createPaywalledArticle = () => {
  const article = mockArticle({
    latest: mockArticleRevision({
      blocks: mockBlockContent({
        event: null,
        html: null,
        comment: null,
        bildwurf: null,
        facebookPost: null,
        facebookVideo: null,
        instagramPost: null,
        tiktokVideo: null,
        youtubeVideo: null,
        soundCloud: null,
        twitter: null,
        polisConversation: null,
        iframe: null,
        imageGallery: null,
        teaserList: null,
        col6: null,
        col1: null,
        flex: null,
        slots: null,
      }),
    }),
  });

  return {
    ...article,
    paywall: activePaywall,
  };
};

describe('Article', () => {
  Object.entries(storiesCmp).forEach(([story, Component]) => {
    it(`should render ${story}`, () => {
      render(<Component />);
    });
  });

  it('adds paywall metadata to article structured data when blocks are gated', () => {
    const article = createPaywalledArticle();

    const seo = getArticleSEO(article);

    expect(seo.schema).toMatchObject({
      '@type': 'NewsArticle',
      isAccessibleForFree: false,
      hasPart: {
        '@type': 'WebPageElement',
        isAccessibleForFree: false,
        cssSelector: '.wepublish-paywalled-content',
      },
    });
  });

  it('does not add paywall metadata to free article structured data', () => {
    const seo = getArticleSEO(mockArticle());

    expect(seo.schema).not.toHaveProperty('isAccessibleForFree');
    expect(seo.schema).not.toHaveProperty('hasPart');
  });

  it('marks gated article blocks with the structured data paywall selector', () => {
    const { container } = render(<storiesCmp.WithPaywalledContent />);
    const paywalledContent = container.querySelector(
      '.wepublish-paywalled-content'
    );

    expect(paywalledContent).not.toBeNull();
    expect(paywalledContent?.childElementCount).toBeGreaterThan(0);
  });
});
