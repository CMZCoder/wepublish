import '@testing-library/jest-dom';

import { createTheme, ThemeProvider } from '@mui/material';
import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

import type {
  PublishReadinessInput,
  PublishReadinessStatus,
} from './publishReadiness';
import { PublishReadinessPanel } from './publishReadinessPanel';
import { PublishReadinessPanelWithAI } from './publishReadinessPanelWithAI';

const mockReviewPublishReadiness = jest.fn();
const mockUseReviewPublishReadinessMutation = jest.fn(() => [
  mockReviewPublishReadiness,
  { loading: false, error: undefined, data: undefined },
]);

jest.mock('@wepublish/editor/api', () => ({
  ...jest.requireActual('@wepublish/editor/api'),
  getApiClientV2: jest.fn(() => undefined),
  useReviewPublishReadinessMutation: (...args: unknown[]) =>
    mockUseReviewPublishReadinessMutation(...args),
}));

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
  beforeEach(() => {
    mockReviewPublishReadiness.mockReset();
    mockReviewPublishReadiness.mockResolvedValue({});
    mockUseReviewPublishReadinessMutation.mockClear();
    mockUseReviewPublishReadinessMutation.mockReturnValue([
      mockReviewPublishReadiness,
      { loading: false, error: undefined, data: undefined },
    ]);
  });

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

      expect(getContrastRatio(getStatusPill(label))).toBeGreaterThanOrEqual(
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

  it('renders optional AI review lane without changing the deterministic score', () => {
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
          ],
        }}
        aiReview={{
          state: 'ready',
          onReview: jest.fn(),
        }}
      />
    );

    expect(screen.getByText('74%')).toBeInTheDocument();
    expect(screen.getByLabelText('AI review')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /run ai review/i })
    ).toBeInTheDocument();
  });

  it('renders an editor-facing discovery map for search, answers, citations and access', () => {
    const metadata: PublishReadinessInput['metadata'] = {
      slug: 'zurich-climate-plan-2026',
      title: 'Zurich presents climate plan for 2026',
      lead: 'Zurich presented its 2026 climate plan with transport measures.',
      authors: [{ name: 'Lina Meier' }],
      tags: ['climate'],
      hidden: false,
      hideAuthor: false,
      paywall: 'member-reporting',
    };

    render(
      <PublishReadinessPanel
        input={{
          type: 'article',
          metadata,
        }}
        result={{
          status: 'review',
          score: 76,
          checks: [
            {
              id: 'seo-title-length',
              category: 'seo-social',
              status: 'pass',
            },
            {
              id: 'description-length',
              category: 'seo-social',
              status: 'warning',
            },
            {
              id: 'social-image',
              category: 'seo-social',
              status: 'pass',
            },
            {
              id: 'canonical-url',
              category: 'seo-social',
              status: 'pass',
            },
            {
              id: 'opening-context-signals',
              category: 'aeo',
              status: 'warning',
            },
            {
              id: 'headings',
              category: 'aeo',
              status: 'pass',
            },
            {
              id: 'named-signals',
              category: 'aeo',
              status: 'pass',
            },
            {
              id: 'visible-author',
              category: 'geo',
              status: 'pass',
            },
            {
              id: 'publish-date',
              category: 'geo',
              status: 'pass',
            },
            {
              id: 'source-links',
              category: 'geo',
              status: 'warning',
            },
            {
              id: 'image-context',
              category: 'geo',
              status: 'pass',
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Discovery map')).toBeInTheDocument();
    expect(screen.getByText('Search preview')).toBeInTheDocument();
    expect(screen.getByText('Answer readiness')).toBeInTheDocument();
    expect(screen.getByText('AI citation trail')).toBeInTheDocument();
    expect(screen.getByText('Access model')).toBeInTheDocument();
    expect(screen.getByText('Paywalled article')).toBeInTheDocument();
  });

  it('keeps discovery map status markers readable on their color backgrounds', () => {
    render(
      <PublishReadinessPanel
        input={{
          type: 'article',
          metadata: {
            slug: 'zurich-climate-plan-2026',
            title: 'Zurich presents climate plan for 2026',
            lead: 'Zurich presented its 2026 climate plan with transport measures.',
            authors: [{ name: 'Lina Meier' }],
            hidden: false,
            hideAuthor: false,
            paywall: 'member-reporting',
          },
        }}
        result={{
          status: 'review',
          score: 68,
          checks: [
            {
              id: 'seo-title-length',
              category: 'seo-social',
              status: 'pass',
            },
            {
              id: 'description-length',
              category: 'seo-social',
              status: 'warning',
            },
            {
              id: 'source-links',
              category: 'geo',
              status: 'risk',
            },
          ],
        }}
      />
    );

    for (const label of [
      'Search preview',
      'AI citation trail',
      'Access model',
    ]) {
      expect(
        getContrastRatio(getDiscoveryStatusMarker(label))
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('renders AI-enabled readiness container and sends bounded context to the mutation', async () => {
    render(
      <PublishReadinessPanelWithAI
        input={{
          type: 'page',
          metadata: {
            slug: 'about',
            title: 'About this newsroom',
            description: 'A concise page about this newsroom and its mission.',
            tags: ['about'],
            hidden: false,
          },
        }}
      />
    );

    expect(screen.getByText('Publish Intelligence')).toBeInTheDocument();
    expect(screen.getByLabelText('AI review')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /run ai review/i })
    );

    expect(mockReviewPublishReadiness).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({
          contentType: 'page',
          metadata: expect.objectContaining({
            slug: 'about',
            title: 'About this newsroom',
            tags: ['about'],
          }),
          deterministicChecks: expect.any(Array),
          signals: expect.objectContaining({
            text: expect.any(String),
          }),
        }),
      },
    });
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

function getStatusPill(label: string) {
  const statusPill = screen
    .getAllByText(label)
    .find(element => element.tagName.toLowerCase() === 'span');

  if (!statusPill) {
    throw new Error(`Missing status pill for ${label}`);
  }

  return statusPill;
}

function getDiscoveryStatusMarker(label: string) {
  const card = screen.getByText(label).closest('article');
  const marker = card?.querySelector('span');

  if (!marker) {
    throw new Error(`Missing discovery status marker for ${label}`);
  }

  return marker;
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
