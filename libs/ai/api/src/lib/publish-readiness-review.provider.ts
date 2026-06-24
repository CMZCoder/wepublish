import type { PublishReadinessReviewInput } from './publish-readiness-review.model';

export interface PublishReadinessReviewProviderResult {
  readonly content: string;
  readonly model?: string;
}

export interface PublishReadinessReviewProvider {
  readonly name: string;
  readonly model: string;
  review(
    input: PublishReadinessReviewInput,
    prompt: string
  ): Promise<string | PublishReadinessReviewProviderResult>;
}
