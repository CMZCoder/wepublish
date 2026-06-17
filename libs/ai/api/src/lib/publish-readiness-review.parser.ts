import { BadRequestException } from '@nestjs/common';

import type {
  PublishReadinessReview,
  PublishReadinessReviewSuggestion,
} from './publish-readiness-review.model';

const CATEGORIES = new Set(['lead', 'seo-social', 'aeo-geo', 'editorial-risk']);
const CONFIDENCE = new Set(['low', 'medium', 'high']);

export function parsePublishReadinessReview(
  response: string
): Omit<PublishReadinessReview, 'provider' | 'model'> {
  let data: unknown;

  try {
    data = JSON.parse(response);
  } catch {
    throw new BadRequestException('AI review returned invalid JSON.');
  }

  if (!isObject(data) || typeof data['summary'] !== 'string') {
    throw new BadRequestException('AI review returned an invalid summary.');
  }

  if (!Array.isArray(data['suggestions']) || !Array.isArray(data['warnings'])) {
    throw new BadRequestException('AI review returned an invalid shape.');
  }

  return {
    summary: data['summary'],
    suggestions: data['suggestions'].map(parseSuggestion),
    warnings: data['warnings'].filter((warning): warning is string => {
      return typeof warning === 'string' && warning.trim().length > 0;
    }),
  };
}

function parseSuggestion(value: unknown): PublishReadinessReviewSuggestion {
  if (!isObject(value)) {
    throw new BadRequestException('AI review returned an invalid suggestion.');
  }

  const {
    id,
    category,
    title,
    currentValue,
    suggestedValue,
    rationale,
    confidence,
  } = value;

  if (
    typeof id !== 'string' ||
    typeof category !== 'string' ||
    !CATEGORIES.has(category) ||
    typeof title !== 'string' ||
    typeof rationale !== 'string' ||
    typeof confidence !== 'string' ||
    !CONFIDENCE.has(confidence)
  ) {
    throw new BadRequestException('AI review returned an invalid suggestion.');
  }

  return {
    id,
    category,
    title,
    currentValue: typeof currentValue === 'string' ? currentValue : undefined,
    suggestedValue:
      typeof suggestedValue === 'string' ? suggestedValue : undefined,
    rationale,
    confidence,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
