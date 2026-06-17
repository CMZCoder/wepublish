import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CanCreateArticle, CanCreatePage } from '@wepublish/permissions';
import { Permissions } from '@wepublish/permissions/api';

import {
  PublishReadinessReview,
  PublishReadinessReviewInput,
} from './publish-readiness-review.model';
import { PublishReadinessReviewService } from './publish-readiness-review.service';

@Resolver()
export class PublishReadinessReviewResolver {
  constructor(private readonly reviewService: PublishReadinessReviewService) {}

  @Permissions(CanCreateArticle, CanCreatePage)
  @Mutation(() => PublishReadinessReview)
  reviewPublishReadiness(
    @Args('input') input: PublishReadinessReviewInput
  ): Promise<PublishReadinessReview> {
    return this.reviewService.review(input);
  }
}
