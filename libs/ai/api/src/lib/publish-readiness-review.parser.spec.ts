import { BadRequestException } from '@nestjs/common';

import { parsePublishReadinessReview } from './publish-readiness-review.parser';

describe('parsePublishReadinessReview', () => {
  it('accepts a structured JSON review response', () => {
    const review = parsePublishReadinessReview(
      JSON.stringify({
        summary: 'The piece should answer the core question earlier.',
        suggestions: [
          {
            id: 'lead-1',
            category: 'lead',
            title: 'Move the practical answer into the lead',
            suggestedValue: 'Zurich plans transport changes for 2026.',
            rationale:
              'This makes the answer visible before background detail.',
            confidence: 'medium',
          },
        ],
        warnings: ['Verify the resident count before publishing.'],
      })
    );

    expect(review.summary).toContain('answer');
    expect(review.suggestions).toHaveLength(1);
    expect(review.warnings).toEqual([
      'Verify the resident count before publishing.',
    ]);
  });

  it('rejects malformed JSON instead of rendering untrusted output', () => {
    expect(() => parsePublishReadinessReview('<p>Not JSON</p>')).toThrow(
      BadRequestException
    );
  });

  it('rejects invalid confidence values', () => {
    expect(() =>
      parsePublishReadinessReview(
        JSON.stringify({
          summary: 'Bad confidence',
          suggestions: [
            {
              id: 'bad',
              category: 'lead',
              title: 'Bad',
              rationale: 'Bad',
              confidence: 'certain',
            },
          ],
          warnings: [],
        })
      )
    ).toThrow(BadRequestException);
  });
});
