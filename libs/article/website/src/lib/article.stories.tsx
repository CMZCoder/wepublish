import { ApolloError } from '@apollo/client';
import { Meta } from '@storybook/react';
import { Article } from './article';
import {
  mockArticle,
  mockArticleRevision,
  mockBlockContent,
} from '@wepublish/storybook/mocks';
import {
  WithPollBlockDecorators,
  WithSubscribeBlockDecorators,
} from '@wepublish/storybook';
import { FullPaywallFragment } from '@wepublish/website/api';

const article = mockArticle();

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

const paywalledArticle = mockArticle({
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

export default {
  component: Article,
  title: 'Components/Article',
  decorators: [WithSubscribeBlockDecorators({}), WithPollBlockDecorators({})],
} as Meta;

export const Default = {
  args: {
    data: { article },
  },
};

export const WithLoading = {
  args: {
    data: {
      article: null,
    },
    loading: true,
  },
};

export const WithError = {
  args: {
    data: {
      article: null,
    },
    error: new ApolloError({
      errorMessage: 'Foobar',
    }),
  },
};

export const WithChildren = {
  args: {
    data: { article },
    children: <div>Children</div>,
  },
};

export const WithoutAuthors = {
  args: {
    data: {
      article: mockArticle({ latest: mockArticleRevision({ authors: [] }) }),
    },
  },
};

export const WithoutSocialMedia = {
  args: {
    data: {
      article: mockArticle({
        latest: mockArticleRevision({
          socialMediaImage: null,
          socialMediaDescription: null,
          socialMediaTitle: null,
        }),
      }),
    },
  },
};

export const WithoutLead = {
  args: {
    data: {
      article: mockArticle({
        latest: mockArticleRevision({
          lead: null,
        }),
      }),
    },
  },
};

export const WithoutImageMetadata = {
  args: {
    data: {
      article: mockArticle({
        latest: mockArticleRevision({
          socialMediaImage: null,
          image: null,
        }),
      }),
    },
  },
};

export const WithPaywalledContent = {
  args: {
    data: {
      article: {
        ...paywalledArticle,
        paywall: activePaywall,
      },
    },
    showPaywall: true,
    hideContent: true,
  },
};
