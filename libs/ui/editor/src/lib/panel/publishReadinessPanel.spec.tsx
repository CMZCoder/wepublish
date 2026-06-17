import '@testing-library/jest-dom';

import { createTheme, ThemeProvider } from '@mui/material';
import { render as rtlRender, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import type { PublishReadinessStatus } from './publishReadiness';
import { PublishReadinessPanel } from './publishReadinessPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? _key,
  }),
}));

const testTheme = createTheme();
const render = (ui: ReactElement) =>
  rtlRender(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>);

describe('PublishReadinessPanel', () => {
  it('renders the readiness score and deterministic proxy disclaimer', () => {
    render(
      <PublishReadinessPanel
        result={{
          status: 'review',
          score: 74,
          checks: [
            {
              id: 'slug',
              category: 'editorial',
              status: 'pass',
            },
            {
              id: 'opening-context-signals',
              category: 'aeo',
              status: 'warning',
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Publish Intelligence')).toBeInTheDocument();
    expect(screen.getByText('74%')).toBeInTheDocument();
    expect(
      screen.getByText(/deterministic proxy signals/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Opening paragraph has weak measurable context signals/i)
    ).toBeInTheDocument();
  });

  it('exposes an accessible score meter and category progress summaries', () => {
    render(
      <PublishReadinessPanel
        result={{
          status: 'review',
          score: 50,
          checks: [
            {
              id: 'slug',
              category: 'editorial',
              status: 'pass',
            },
            {
              id: 'title',
              category: 'editorial',
              status: 'risk',
            },
            {
              id: 'canonical-url',
              category: 'seo-social',
              status: 'warning',
            },
          ],
        }}
      />
    );

    expect(
      screen.getByRole('meter', { name: /publish score/i })
    ).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('1 risk')).toBeInTheDocument();
    expect(screen.getByText('1 warning')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 passed')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 passed')).toBeInTheDocument();
  });

  it('keeps semantic status and check markers readable on their color backgrounds', () => {
    const statuses: Array<{
      label: string;
      status: PublishReadinessStatus;
    }> = [
      { label: 'Ready', status: 'ready' },
      { label: 'Needs review', status: 'review' },
      { label: 'Risky', status: 'risky' },
    ];

    for (const { label, status } of statuses) {
      const view = render(
        <PublishReadinessPanel
          result={{
            status,
            score: 50,
            checks: [
              {
                id: 'slug',
                category: 'editorial',
                status: 'pass',
              },
            ],
          }}
        />
      );

      expect(getContrastRatio(screen.getByText(label))).toBeGreaterThanOrEqual(
        4.5
      );
      view.unmount();
    }

    render(
      <PublishReadinessPanel
        result={{
          status: 'risky',
          score: 38,
          checks: [
            {
              id: 'slug',
              category: 'editorial',
              status: 'risk',
            },
            {
              id: 'tags',
              category: 'editorial',
              status: 'warning',
            },
            {
              id: 'hidden',
              category: 'editorial',
              status: 'pass',
            },
          ],
        }}
      />
    );

    expect(getCheckIconContrast('Slug is missing.')).toBeGreaterThanOrEqual(
      4.5
    );
    expect(getCheckIconContrast('No tags are set.')).toBeGreaterThanOrEqual(
      4.5
    );
    expect(
      getCheckIconContrast('Content is discoverable by default.')
    ).toBeGreaterThanOrEqual(4.5);
  });
});

function getCheckIconContrast(label: string) {
  const item = screen.getByText(label).closest('li');

  if (!item) {
    throw new Error(`Missing check item for ${label}`);
  }

  const icon = item.querySelector('span');

  if (!icon) {
    throw new Error(`Missing check icon for ${label}`);
  }

  return getContrastRatio(icon);
}

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
