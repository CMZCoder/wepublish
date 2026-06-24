import type { PublishReadinessReviewInput } from './publish-readiness-review.model';
import { buildPublishReadinessReviewPrompt } from './publish-readiness-review.prompt';

describe('buildPublishReadinessReviewPrompt', () => {
  it('uses a compact, capped review context for gateway-friendly requests', () => {
    const prompt = buildPublishReadinessReviewPrompt({
      contentType: 'article',
      deterministicStatus: 'review',
      deterministicScore: 71,
      deterministicChecks: [
        { id: 'opening-context-signals', category: 'aeo', status: 'warning' },
      ],
      metadata: {
        title: 'Zurich climate plan changes commuter routes in 2026',
        leadOrDescription: 'Zurich plans new transport rules from 2026.',
        seoTitle: undefined,
        socialMediaTitle: undefined,
        socialMediaDescription: undefined,
        slug: 'zurich-climate-plan-2026',
        url: 'http://localhost:3000/a/zurich-climate-plan-2026',
        canonicalUrl: undefined,
        authors: ['Dev User'],
        tags: ['climate'],
        hasImage: true,
        hidden: false,
        hideAuthor: false,
        publishedAt: '2026-06-24T00:00:00.000Z',
      },
      signals: {
        text: 'x'.repeat(2200),
        firstParagraph: 'y'.repeat(800),
        headingCount: 0,
        listCount: 0,
        sourceLinks: ['https://example.com/source'],
        imageCount: 1,
        captionCount: 1,
      },
    } satisfies PublishReadinessReviewInput);

    expect(prompt).toContain('Return minified JSON only');
    expect(prompt).toContain('"sourceLinkCount":1');
    expect(prompt).not.toContain('"sourceLinks"');
    expect(prompt).not.toContain('x'.repeat(2000));
    expect(prompt).not.toContain('y'.repeat(600));
  });
});
