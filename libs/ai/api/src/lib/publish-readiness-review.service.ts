import { Injectable } from '@nestjs/common';

import type {
  PublishReadinessReview,
  PublishReadinessReviewInput,
} from './publish-readiness-review.model';
import { parsePublishReadinessReview } from './publish-readiness-review.parser';
import type {
  PublishReadinessReviewProvider,
  PublishReadinessReviewProviderResult,
} from './publish-readiness-review.provider';
import { buildPublishReadinessReviewPrompt } from './publish-readiness-review.prompt';

@Injectable()
export class PublishReadinessReviewService {
  constructor(private readonly provider: PublishReadinessReviewProvider) {}

  async review(
    input: PublishReadinessReviewInput
  ): Promise<PublishReadinessReview> {
    const result = normalizeProviderResult(
      await this.provider.review(
        input,
        buildPublishReadinessReviewPrompt(input)
      )
    );
    const parsed = parsePublishReadinessReview(result.content);

    return {
      provider: this.provider.name,
      model: result.model ?? this.provider.model,
      ...parsed,
    };
  }
}

function normalizeProviderResult(
  result: string | PublishReadinessReviewProviderResult
): PublishReadinessReviewProviderResult {
  if (typeof result === 'string') {
    return { content: result };
  }

  return result;
}
