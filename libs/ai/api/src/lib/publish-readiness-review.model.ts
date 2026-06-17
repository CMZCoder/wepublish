import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class PublishReadinessReviewCheckInput {
  @Field()
  id!: string;

  @Field()
  category!: string;

  @Field()
  status!: string;
}

@InputType()
export class PublishReadinessReviewMetadataInput {
  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  seoTitle?: string;

  @Field({ nullable: true })
  leadOrDescription?: string;

  @Field({ nullable: true })
  socialMediaTitle?: string;

  @Field({ nullable: true })
  socialMediaDescription?: string;

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => [String])
  authors!: string[];

  @Field(() => [String])
  tags!: string[];

  @Field()
  hasImage!: boolean;

  @Field()
  hidden!: boolean;

  @Field()
  hideAuthor!: boolean;

  @Field({ nullable: true })
  publishedAt?: string;
}

@InputType()
export class PublishReadinessReviewSignalsInput {
  @Field()
  text!: string;

  @Field()
  firstParagraph!: string;

  @Field(() => Int)
  headingCount!: number;

  @Field(() => Int)
  listCount!: number;

  @Field(() => [String])
  sourceLinks!: string[];

  @Field(() => Int)
  imageCount!: number;

  @Field(() => Int)
  captionCount!: number;
}

@InputType()
export class PublishReadinessReviewInput {
  @Field()
  contentType!: string;

  @Field(() => PublishReadinessReviewMetadataInput)
  metadata!: PublishReadinessReviewMetadataInput;

  @Field()
  deterministicStatus!: string;

  @Field(() => Int)
  deterministicScore!: number;

  @Field(() => [PublishReadinessReviewCheckInput])
  deterministicChecks!: PublishReadinessReviewCheckInput[];

  @Field(() => PublishReadinessReviewSignalsInput)
  signals!: PublishReadinessReviewSignalsInput;
}

@ObjectType()
export class PublishReadinessReviewSuggestion {
  @Field()
  id!: string;

  @Field()
  category!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  currentValue?: string;

  @Field({ nullable: true })
  suggestedValue?: string;

  @Field()
  rationale!: string;

  @Field()
  confidence!: string;
}

@ObjectType()
export class PublishReadinessReview {
  @Field()
  provider!: string;

  @Field()
  model!: string;

  @Field()
  summary!: string;

  @Field(() => [PublishReadinessReviewSuggestion])
  suggestions!: PublishReadinessReviewSuggestion[];

  @Field(() => [String])
  warnings!: string[];
}
