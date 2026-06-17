import { EditorBlockType } from '@wepublish/editor/api';
import { BlockFormat } from '@wepublish/richtext';

import type { PublishReadinessInput } from './publishReadiness';
import { getPublishReadiness } from './publishReadiness';
import { getPublishReadinessReviewContext } from './publishReadinessReviewContext';

describe('getPublishReadinessReviewContext', () => {
  it('keeps only bounded metadata, deterministic findings, and plain text signals', () => {
    const input: PublishReadinessInput = {
      type: 'article',
      publishedAt: new Date('2026-06-17T10:00:00.000Z'),
      metadata: {
        slug: 'zurich-climate-plan-2026',
        title: 'Zurich presents climate plan for 2026',
        seoTitle: 'Zurich climate plan 2026',
        lead: 'Zurich presented its 2026 climate plan with new transport measures.',
        authors: [{ name: 'Lina Meier' }],
        tags: ['climate', 'zurich'],
        image: { filename: 'zurich.jpg' },
        socialMediaDescription:
          'Transport, housing and energy changes for Zurich residents.',
        hidden: false,
        hideAuthor: false,
        canonicalUrl: 'https://example.com/zurich-climate-plan-2026',
        url: 'https://publisher.example/zurich-climate-plan-2026',
      },
      blocks: [
        {
          key: 'intro',
          type: EditorBlockType.RichText,
          value: {
            richText: [
              {
                type: BlockFormat.Paragraph,
                children: [
                  {
                    text: 'Zurich officials said the 2026 plan affects 420000 residents.',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const context = getPublishReadinessReviewContext(
      input,
      getPublishReadiness(input)
    );

    expect(context.contentType).toBe('article');
    expect(context.metadata.title).toBe(
      'Zurich presents climate plan for 2026'
    );
    expect(context.metadata.authors).toEqual(['Lina Meier']);
    expect(context.signals.firstParagraph).toContain('Zurich officials');
    expect(context.deterministicChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'opening-context-signals' }),
      ])
    );
    expect(JSON.stringify(context)).not.toContain('key');
    expect(JSON.stringify(context)).not.toContain('richText');
  });

  it('truncates long plain text before sending it to an AI provider', () => {
    const longText = 'Zurich '.repeat(600);
    const input: PublishReadinessInput = {
      type: 'page',
      metadata: {
        slug: 'long-page',
        title: 'Long page',
        description: 'A long page with too much body text.',
      },
      blocks: [
        {
          key: 'html',
          type: EditorBlockType.Html,
          value: { html: `<p>${longText}</p>` },
        },
      ],
    };

    const context = getPublishReadinessReviewContext(
      input,
      getPublishReadiness(input)
    );

    expect(context.signals.text.length).toBeLessThanOrEqual(2200);
  });
});
