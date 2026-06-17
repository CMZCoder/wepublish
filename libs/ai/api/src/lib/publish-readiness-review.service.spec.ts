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
