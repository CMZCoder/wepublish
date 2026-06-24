import '@testing-library/jest-dom';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

import {
  PublishReadinessAIReview,
  type PublishReadinessAIReviewController,
} from './publish-readiness-ai-review';

const theme = createTheme();
const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

jest.mock('react-i18next', () => {
  const en = jest.requireActual(
    `${process.cwd()}/apps/editor/src/app/locales/en.json`
  );

  function readTranslation(key: string) {
    return key
      .split('.')
      .reduce<unknown>(
        (value, segment) =>
          value && typeof value === 'object' ?
            (value as Record<string, unknown>)[segment]
          : undefined,
        en.translation
      );
  }

  function interpolate(value: string, options?: Record<string, unknown>) {
    return value.replace(/{{\s*(\w+)\s*}}/g, (_match, name: string) =>
      String(options?.[name] ?? '')
    );
  }

  return {
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) => {
        const value = readTranslation(key);

        return typeof value === 'string' ? interpolate(value, options) : key;
      },
    }),
  };
});

describe('PublishReadinessAIReview', () => {
  it('renders unavailable state without implying AI validation', () => {
    renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'unavailable',
          message: 'Configure an AI provider to run editorial suggestions.',
        }}
      />
    );

    expect(screen.getByLabelText('AI review')).toBeInTheDocument();
    expect(screen.getByText('AI review')).toBeInTheDocument();
    expect(
      screen.getByText(/Configure an AI provider to run editorial suggestions/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/validated/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/deterministic checks|human review/i)
    ).not.toBeInTheDocument();
  });

  it('runs manual review from ready state', async () => {
    const onReview = jest.fn();

    renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'ready',
          onReview,
        }}
      />
    );

    const button = screen.getByRole('button', { name: /run ai review/i });

    await userEvent.click(button);

    expect(onReview).toHaveBeenCalledTimes(1);
    expect(getContrastRatio(button)).toBeGreaterThanOrEqual(4.5);
  });

  it('renders loading and error states as non-blocking editor feedback', () => {
    const { rerender } = renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'loading',
        }}
      />
    );

    expect(screen.getByLabelText('AI review')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('button', { name: /reviewing/i })).toBeDisabled();

    const retryController: PublishReadinessAIReviewController = {
      state: 'error',
      message: 'Provider quota reached. Try again later.',
      onReview: jest.fn(),
    };

    rerender(
      <ThemeProvider theme={theme}>
        <PublishReadinessAIReview controller={retryController} />
      </ThemeProvider>
    );

    expect(screen.getByText(/Provider quota reached/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry ai review/i })
    ).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Provider quota reached/i
    );
    expect(getContrastRatio(screen.getByRole('alert'))).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it('renders grouped suggestions and human-review warnings', () => {
    renderWithTheme(
      <PublishReadinessAIReview
        controller={{
          state: 'suggestions',
          summary: 'The piece can answer the main question earlier.',
          suggestions: [
            {
              id: 'lead-1',
              category: 'lead',
              title: 'Make the lead answer-first',
              suggestedValue: 'Zurich plans transport changes for 2026.',
              rationale: 'The current opening delays the practical answer.',
              confidence: 'medium',
            },
            {
              id: 'geo-1',
              category: 'aeo-geo',
              title: 'Add a source cue near the numbers',
              rationale:
                'The reader can see the number but not who supplied it.',
              confidence: 'low',
            },
          ],
          warnings: ['Verify the quoted resident count before publishing.'],
          onReview: jest.fn(),
        }}
      />
    );

    expect(
      screen.getByText('The piece can answer the main question earlier.')
    ).toBeInTheDocument();
    expect(screen.getByText('Lead and answer')).toBeInTheDocument();
    expect(screen.getByText('AEO/GEO clarity')).toBeInTheDocument();
    expect(screen.getByText('Make the lead answer-first')).toBeInTheDocument();
    expect(
      screen.getByText(/Verify the quoted resident count/i)
    ).toBeInTheDocument();
  });
});

function getContrastRatio(element: Element) {
  const { backgroundColor, color } = getComputedStyle(element);
  const foregroundLuminance = getRelativeLuminance(color);
  const backgroundLuminance = getRelativeLuminance(backgroundColor);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: string) {
  const channels = color
    .match(/\d+(\.\d+)?/g)
    ?.slice(0, 3)
    .map(Number);

  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported color format: ${color}`);
  }

  const [red, green, blue] = channels.map(channel => {
    const normalized = channel / 255;

    return normalized <= 0.03928 ?
        normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
