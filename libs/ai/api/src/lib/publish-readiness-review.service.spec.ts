import { BadRequestException } from '@nestjs/common';

import type { PublishReadinessReviewInput } from './publish-readiness-review.model';
import type { PublishReadinessReviewProvider } from './publish-readiness-review.provider';
import { PublishReadinessReviewService } from './publish-readiness-review.service';

const input = {
  contentType: 'article',
  metadata: {
    title: 'Zurich presents climate plan for 2026',
    authors: ['Lina Meier'],
    tags: ['climate'],
    hasImage: true,
    hidden: false,
    hideAuthor: false,
  },
  deterministicStatus: 'review',
  deterministicScore: 74,
  deterministicChecks: [
    { id: 'opening-context-signals', category: 'aeo', status: 'warning' },
  ],
  signals: {
    text: 'Zurich officials said the plan affects residents.',
    firstParagraph: 'Zurich officials said the plan affects residents.',
    headingCount: 1,
    listCount: 0,
    sourceLinks: ['https://example.com/source'],
    imageCount: 1,
    captionCount: 1,
  },
} satisfies PublishReadinessReviewInput;

describe('PublishReadinessReviewService', () => {
  it('returns parsed provider suggestions with provider metadata', async () => {
    const provider: PublishReadinessReviewProvider = {
      name: 'test',
      model: 'fixture',
      review: jest.fn().mockResolvedValue(
        JSON.stringify({
          summary: 'Move the answer earlier.',
          suggestions: [
            {
              id: 'lead-1',
              category: 'lead',
              title: 'Lead with the answer',
              suggestedValue: 'Zurich plans climate measures for 2026.',
              rationale: 'The deterministic AEO signal is weak.',
              confidence: 'medium',
            },
          ],
          warnings: [],
        })
      ),
    };

    const service = new PublishReadinessReviewService(provider);
    const result = await service.review(input);

    expect(result.provider).toBe('test');
    expect(result.model).toBe('fixture');
    expect(result.suggestions[0].category).toBe('lead');
  });

  it('uses the concrete model returned by a fallback provider result', async () => {
    const provider: PublishReadinessReviewProvider = {
      name: 'unlimited-surf',
      model: 'claude-sonnet-4-6-20260101',
      review: jest.fn().mockResolvedValue({
        model: 'gpt-5.5',
        content: JSON.stringify({
          summary: 'Fallback helper reviewed this article.',
          suggestions: [],
          warnings: [],
        }),
      }),
    };

    const service = new PublishReadinessReviewService(provider);
    const result = await service.review(input);

    expect(result.provider).toBe('unlimited-surf');
    expect(result.model).toBe('gpt-5.5');
    expect(result.summary).toBe('Fallback helper reviewed this article.');
  });

  it('rejects invalid provider output', async () => {
    const provider: PublishReadinessReviewProvider = {
      name: 'test',
      model: 'fixture',
      review: jest.fn().mockResolvedValue('<p>HTML</p>'),
    };

    const service = new PublishReadinessReviewService(provider);

    await expect(service.review(input)).rejects.toThrow(BadRequestException);
  });
});
