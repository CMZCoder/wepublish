import { Injectable } from '@nestjs/common';

import type {
  PublishReadinessReview,
  PublishReadinessReviewInput,
} from './publish-readiness-review.model';
import { parsePublishReadinessReview } from './publish-readiness-review.parser';
import type { PublishReadinessReviewProvider } from './publish-readiness-review.provider';
import { buildPublishReadinessReviewPrompt } from './publish-readiness-review.prompt';

@Injectable()
export class PublishReadinessReviewService {
  constructor(private readonly provider: PublishReadinessReviewProvider) {}

  async review(
    input: PublishReadinessReviewInput
  ): Promise<PublishReadinessReview> {
    const raw = await this.provider.review(
      input,
      buildPublishReadinessReviewPrompt(input)
    );
    const parsed = parsePublishReadinessReview(raw);

    return {
      provider: this.provider.name,
      model: this.provider.model,
      ...parsed,
    };
  }
}
