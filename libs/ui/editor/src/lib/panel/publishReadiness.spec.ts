import { EditorBlockType } from '@wepublish/editor/api';
import { BlockFormat, InlineFormat } from '@wepublish/richtext';

import { EmbedType } from '../blocks/types';
import { getPublishReadiness, PublishReadinessInput } from './publishReadiness';

describe('getPublishReadiness', () => {
  const getCheck = (
    result: ReturnType<typeof getPublishReadiness>,
    id: string
  ) => {
    const check = result.checks.find(check => check.id === id);
    if (!check) {
      throw new Error(`Expected readiness check "${id}" to exist.`);
    }

    return check;
  };

  it('marks an article as risky when required publishing metadata is missing', () => {
    const input: PublishReadinessInput = {
      type: 'article',
      publishedAt: new Date('2026-06-17T10:00:00.000Z'),
      metadata: {
        slug: '',
        title: '',
        seoTitle: '',
        lead: '',
        authors: [],
        tags: [],
        image: undefined,
        socialMediaTitle: '',
        socialMediaDescription: '',
        socialMediaAuthors: [],
        socialMediaImage: undefined,
        hidden: false,
        hideAuthor: false,
        canonicalUrl: '',
      },
      blocks: [],
    };

    const result = getPublishReadiness(input);

    expect(result.status).toBe('risky');
    expect(result.score).toBeLessThan(50);
    expect(getCheck(result, 'slug').status).toBe('risk');
    expect(getCheck(result, 'title').status).toBe('risk');
    expect(getCheck(result, 'visible-author').status).toBe('risk');
    expect(getCheck(result, 'opening-context-signals').status).toBe('warning');
  });

  it('uses observable metadata and block proxy signals for article readiness', () => {
    const input: PublishReadinessInput = {
      type: 'article',
      publishedAt: new Date('2026-06-17T10:00:00.000Z'),
      metadata: {
        slug: 'zurich-climate-plan-2026',
        title: 'Zurich presents climate plan for 2026',
        seoTitle: 'Zurich climate plan 2026: What changes for residents',
        lead: 'Zurich presented its 2026 climate plan with new transport, housing and energy measures for residents.',
        authors: [{ id: 'author-1', name: 'Lina Meier' }],
        tags: ['climate', 'zurich'],
        image: { id: 'image-1', filename: 'zurich-plan.jpg' },
        socialMediaTitle: 'Zurich climate plan 2026',
        socialMediaDescription:
          'The city plan explains transport, housing and energy measures for Zurich residents in 2026.',
        socialMediaAuthors: [{ id: 'author-1', name: 'Lina Meier' }],
        socialMediaImage: { id: 'image-2', filename: 'share-zurich.jpg' },
        hidden: false,
        hideAuthor: false,
        canonicalUrl: 'https://example.com/zurich-climate-plan-2026',
      },
      blocks: [
        {
          key: 'title',
          type: EditorBlockType.Title,
          value: {
            preTitle: '',
            title: 'Zurich presents climate plan for 2026',
            lead: 'Zurich presented its 2026 climate plan with new transport measures.',
          },
        },
        {
          key: 'intro',
          type: EditorBlockType.RichText,
          value: {
            richText: [
              {
                type: BlockFormat.H2,
                children: [{ text: 'What changes in 2026?' }],
              },
              {
                type: BlockFormat.Paragraph,
                children: [
                  {
                    text: 'Zurich officials said the 2026 plan affects 420000 residents and focuses on public transport.',
                  },
                  {
                    type: InlineFormat.Link,
                    url: 'https://stadt-zuerich.example/source',
                    title: 'source',
                    children: [{ text: 'City source' }],
                  },
                ],
              },
            ],
          },
        },
        {
          key: 'image',
          type: EditorBlockType.Image,
          value: {
            image: { id: 'image-3', filename: 'zurich-townhall.jpg' },
            caption: 'Zurich town hall during the 2026 climate briefing.',
          },
        },
      ],
    };

    const result = getPublishReadiness(input);

    expect(result.status).toBe('ready');
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(getCheck(result, 'social-image').status).toBe('pass');
    expect(getCheck(result, 'opening-context-signals').status).toBe('pass');
    expect(getCheck(result, 'source-links').status).toBe('pass');
    expect(getCheck(result, 'image-context').status).toBe('pass');
  });

  it('only treats explicit iframe or custom embed URLs as source-link signals', () => {
    const baseInput: PublishReadinessInput = {
      type: 'page',
      metadata: {
        slug: 'embed-source-signals',
        title: 'Embed source signals',
        description:
          'A deterministic check should not invent source URLs for social embeds.',
        hidden: false,
      },
      blocks: [
        {
          key: 'facebook',
          type: EditorBlockType.Embed,
          value: {
            type: EmbedType.FacebookPost,
            userID: 'wepublish',
            postID: '123',
          },
        },
      ],
    };

    expect(
      getCheck(getPublishReadiness(baseInput), 'source-links').status
    ).toBe('warning');

    expect(
      getCheck(
        getPublishReadiness({
          ...baseInput,
          blocks: [
            ...(baseInput.blocks ?? []),
            {
              key: 'iframe',
              type: EditorBlockType.Embed,
              value: {
                type: EmbedType.Other,
                url: 'https://example.com/source',
              },
            },
          ],
        }),
        'source-links'
      ).status
    ).toBe('pass');
  });
});
