import type {
  AIReviewSuggestion,
  AIReviewSuggestionCategory,
  PublishReadinessAIReviewController,
} from '@wepublish/ai/editor';
import {
  type PublishReadinessReviewInput as PublishReadinessReviewMutationInput,
  type ReviewPublishReadinessMutation,
  getApiClientV2,
  useReviewPublishReadinessMutation,
} from '@wepublish/editor/api';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PublishReadinessInput } from './publishReadiness';
import { getPublishReadiness } from './publishReadiness';
import {
  type PublishReadinessPanelProps,
  PublishReadinessPanel,
} from './publishReadinessPanel';
import {
  type PublishReadinessReviewContext,
  getPublishReadinessReviewContext,
} from './publishReadinessReviewContext';

type ReviewSuggestion =
  ReviewPublishReadinessMutation['reviewPublishReadiness']['suggestions'][number];

const SUGGESTION_CATEGORIES = new Set([
  'lead',
  'seo-social',
  'aeo-geo',
  'editorial-risk',
]);
const CONFIDENCE = new Set(['low', 'medium', 'high']);

export function PublishReadinessPanelWithAI({
  input,
  variant,
}: {
  readonly input: PublishReadinessInput;
  readonly variant?: PublishReadinessPanelProps['variant'];
}) {
  const { t } = useTranslation();
  const readiness = useMemo(() => getPublishReadiness(input), [input]);
  const context = useMemo(
    () => getPublishReadinessReviewContext(input, readiness),
    [input, readiness]
  );
  const mutationInput = useMemo(() => toMutationInput(context), [context]);
  const [reviewPublishReadiness, review] = useReviewPublishReadinessMutation({
    client: getApiClientV2(),
  });
  const [hasRequestedReview, setHasRequestedReview] = useState(false);

  const onReview = useCallback(async () => {
    setHasRequestedReview(true);
    await reviewPublishReadiness({
      variables: {
        input: mutationInput,
      },
    }).catch(() => undefined);
  }, [mutationInput, reviewPublishReadiness]);

  const aiReview: PublishReadinessAIReviewController =
    review.loading ? { state: 'loading', onReview }
    : review.error ? { state: 'error', message: review.error.message, onReview }
    : review.data?.reviewPublishReadiness ?
      {
        state: 'suggestions',
        summary: review.data.reviewPublishReadiness.summary,
        suggestions: toAIReviewSuggestions(
          review.data.reviewPublishReadiness.suggestions
        ),
        warnings: review.data.reviewPublishReadiness.warnings,
        onReview,
      }
    : {
        state: hasRequestedReview ? 'error' : 'ready',
        message:
          hasRequestedReview ? t('publishReadiness.aiReview.empty') : undefined,
        onReview,
      };

  return (
    <PublishReadinessPanel
      input={input}
      result={readiness}
      aiReview={aiReview}
      variant={variant}
    />
  );
}

function toMutationInput(
  context: PublishReadinessReviewContext
): PublishReadinessReviewMutationInput {
  return {
    contentType: context.contentType,
    metadata: {
      ...context.metadata,
      authors: [...context.metadata.authors],
      tags: [...context.metadata.tags],
    },
    deterministicStatus: context.deterministicStatus,
    deterministicScore: context.deterministicScore,
    deterministicChecks: context.deterministicChecks.map(
      ({ id, category, status }) => ({
        id,
        category,
        status,
      })
    ),
    signals: {
      ...context.signals,
      sourceLinks: [...context.signals.sourceLinks],
    },
  };
}

function toAIReviewSuggestions(
  suggestions: readonly ReviewSuggestion[]
): AIReviewSuggestion[] {
  return suggestions.map(suggestion => ({
    id: suggestion.id,
    category: toSuggestionCategory(suggestion.category),
    title: suggestion.title,
    currentValue: suggestion.currentValue,
    suggestedValue: suggestion.suggestedValue,
    rationale: suggestion.rationale,
    confidence: toConfidence(suggestion.confidence),
  }));
}

function toSuggestionCategory(value: string): AIReviewSuggestionCategory {
  return SUGGESTION_CATEGORIES.has(value) ?
      (value as AIReviewSuggestionCategory)
    : 'editorial-risk';
}

function toConfidence(value: string): AIReviewSuggestion['confidence'] {
  return CONFIDENCE.has(value) ?
      (value as AIReviewSuggestion['confidence'])
    : 'low';
}
