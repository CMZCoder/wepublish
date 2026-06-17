import styled from '@emotion/styled';
import type { Theme } from '@mui/material/styles';
import {
  type PublishReadinessAIReviewController,
  PublishReadinessAIReview,
} from '@wepublish/ai/editor';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdCheckCircle,
  MdErrorOutline,
  MdFactCheck,
  MdInfoOutline,
  MdReportProblem,
} from 'react-icons/md';

import type {
  PublishReadinessCategory,
  PublishReadinessCheck,
  PublishReadinessCheckStatus,
  PublishReadinessInput,
  PublishReadinessResult,
  PublishReadinessStatus,
} from './publishReadiness';
import { getPublishReadiness } from './publishReadiness';

export interface PublishReadinessPanelProps {
  readonly input?: PublishReadinessInput;
  readonly result?: PublishReadinessResult;
  readonly aiReview?: PublishReadinessAIReviewController;
}

const Root = styled.section`
  background:
    linear-gradient(
      135deg,
      ${({ theme }) => theme.palette.primary.light}1f,
      transparent 38%
    ),
    ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  box-shadow: 0 10px 28px rgb(26 126 224 / 7%);
  container-type: inline-size;
  margin: 20px 0;
  overflow: hidden;
`;

const Header = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px;

  @container (max-width: 420px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const HeadingGroup = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr;
  min-width: 0;
`;

const TitleIcon = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.palette.primary.light}33;
  border: 1px solid ${({ theme }) => theme.palette.primary.light};
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.primary.dark};
  display: inline-flex;
  flex: 0 0 auto;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0;
`;

const HeaderMeta = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  max-width: 58ch;
`;

const Status = styled.span<{ status: PublishReadinessStatus }>`
  align-items: center;
  background: ${({ status, theme }) => getStatusTone(status, theme).background};
  border: 1px solid
    ${({ status, theme }) => getStatusTone(status, theme).border};
  border-radius: 999px;
  color: ${({ status, theme }) => getStatusTone(status, theme).color};
  display: inline-flex;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  padding: 4px 8px;

  svg {
    color: currentColor;
  }
`;

const SummaryPill = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.palette.grey[50]};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 999px;
  color: ${({ theme }) => theme.palette.text.secondary};
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
  line-height: 1.2;
  padding: 4px 8px;
`;

const ScoreMeter = styled.div<{ status: PublishReadinessStatus }>`
  --score-color: ${({ status, theme }) =>
    status === 'ready' ? theme.palette.success.main
    : status === 'review' ? theme.palette.warning.main
    : theme.palette.error.main};

  align-items: center;
  background: conic-gradient(
    var(--score-color) var(--score-arc),
    ${({ theme }) => theme.palette.grey[100]} 0
  );
  border-radius: 999px;
  color: ${({ theme }) => theme.palette.text.primary};
  display: inline-grid;
  flex: 0 0 auto;
  font-size: 19px;
  font-weight: 800;
  height: 70px;
  justify-items: center;
  line-height: 1;
  place-items: center;
  position: relative;
  width: 70px;

  &:before {
    background: ${({ theme }) => theme.palette.background.paper};
    border-radius: inherit;
    content: '';
    inset: 7px;
    position: absolute;
  }

  span {
    position: relative;
  }

  small {
    color: ${({ theme }) => theme.palette.text.secondary};
    display: block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0;
    margin-top: 2px;
  }
`;

const Body = styled.div`
  display: grid;
  gap: 12px;
  padding: 14px 16px 16px;
`;

const CategoryGrid = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @container (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Category = styled.div`
  background: ${({ theme }) => theme.palette.common.white};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  min-width: 0;
  overflow: hidden;
`;

const CategoryHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.palette.grey[50]};
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[200]};
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding: 9px 10px;
`;

const CategoryTitle = styled.h4`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0;
  text-transform: uppercase;
`;

const CategoryProgress = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 700;
`;

const CheckList = styled.ul`
  display: grid;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0 10px;
`;

const CheckItem = styled.li`
  align-items: flex-start;
  display: grid;
  font-size: 12px;
  gap: 9px;
  grid-template-columns: 18px 1fr;
  line-height: 1.4;
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.palette.grey[100]};
  }
`;

const CheckIcon = styled.span<{ status: PublishReadinessCheckStatus }>`
  align-items: center;
  background: ${({ status, theme }) => getCheckTone(status, theme).background};
  border-radius: 999px;
  color: ${({ status, theme }) => getCheckTone(status, theme).color};
  display: inline-flex;
  height: 18px;
  justify-content: center;
  margin-top: 1px;
  width: 18px;

  svg {
    color: currentColor;
    height: 14px;
    width: 14px;
  }
`;

const CheckText = styled.span`
  color: ${({ theme }) => theme.palette.text.primary};
  min-width: 0;
  overflow-wrap: anywhere;
`;

const CATEGORY_ORDER: PublishReadinessCategory[] = [
  'editorial',
  'seo-social',
  'aeo',
  'geo',
];

const CATEGORY_DEFAULTS: Record<PublishReadinessCategory, string> = {
  editorial: 'Editorial basics',
  'seo-social': 'SEO & social',
  aeo: 'AEO proxy signals',
  geo: 'GEO proxy signals',
};

const CHECK_DEFAULTS: Record<string, Record<string, string>> = {
  slug: {
    pass: 'Slug is present.',
    risk: 'Slug is missing.',
  },
  title: {
    pass: 'Title is present.',
    risk: 'Title is missing or too short.',
  },
  summary: {
    pass: 'Lead or description is present.',
    risk: 'Lead or description is missing.',
  },
  'visible-author': {
    pass: 'Visible author signal is present.',
    warning: 'Author exists but is hidden from the visible article.',
    risk: 'Author is missing.',
  },
  tags: {
    pass: 'Tags are present.',
    warning: 'No tags are set.',
  },
  image: {
    pass: 'Image signal is present.',
    warning: 'No main or content image was found.',
  },
  hidden: {
    pass: 'Content is discoverable by default.',
    warning: 'Content is hidden and may be harder to discover.',
  },
  'seo-title-length': {
    pass: 'SEO title length is within the target range.',
    warning: 'SEO title is missing, short, or long.',
  },
  'description-length': {
    pass: 'Description length is within the target range.',
    warning: 'Description is missing, short, or long.',
  },
  'social-image': {
    pass: 'Social preview image is available.',
    warning: 'Social preview image is missing.',
  },
  'canonical-url': {
    pass: 'Canonical URL is empty or valid.',
    warning: 'Canonical URL is not a valid http(s) URL.',
  },
  'opening-context-signals': {
    pass: 'Opening paragraph has measurable context signals.',
    warning: 'Opening paragraph has weak measurable context signals.',
  },
  headings: {
    pass: 'Headings or list structure are present.',
    warning: 'No heading or list structure was found.',
  },
  'named-signals': {
    pass: 'Visible text contains names, numbers, or date-like signals.',
    warning: 'Visible text has few measurable entity/date/number signals.',
  },
  'publish-date': {
    pass: 'Publish date is set.',
    warning: 'Publish date is not set.',
  },
  'source-links': {
    pass: 'Source or external links are present.',
    warning: 'No source or external links were found.',
  },
  'image-context': {
    pass: 'Image caption/context is present.',
    warning: 'Image caption/context is missing.',
  },
};

export function PublishReadinessPanel({
  input,
  result,
  aiReview,
}: PublishReadinessPanelProps) {
  const { t } = useTranslation();
  const readiness = useMemo(
    () => result ?? (input ? getPublishReadiness(input) : undefined),
    [input, result]
  );

  if (!readiness) return null;

  const totals = getTotals(readiness.checks);
  const scoreStyle = {
    '--score-arc': `${readiness.score}%`,
  } as CSSProperties;
  const riskSummaryKey =
    totals.risks === 1 ?
      'publishReadiness.summary.risk'
    : 'publishReadiness.summary.risks';
  const warningSummaryKey =
    totals.warnings === 1 ?
      'publishReadiness.summary.warning'
    : 'publishReadiness.summary.warnings';

  return (
    <Root
      aria-label={t('publishReadiness.title', {
        defaultValue: 'Publish Intelligence',
      })}
    >
      <Header>
        <HeadingGroup>
          <TitleIcon aria-hidden="true">
            <MdFactCheck />
          </TitleIcon>
          <div>
            <Title>
              {t('publishReadiness.title', {
                defaultValue: 'Publish Intelligence',
              })}
            </Title>
            <HeaderMeta>
              <Status status={readiness.status}>
                {getStatusIcon(readiness.status)}
                {t(`publishReadiness.status.${readiness.status}`, {
                  defaultValue: getStatusLabel(readiness.status),
                })}
              </Status>
              <SummaryPill>
                <MdReportProblem aria-hidden="true" />
                {t(riskSummaryKey, {
                  count: totals.risks,
                  defaultValue: `${totals.risks} ${
                    totals.risks === 1 ? 'risk' : 'risks'
                  }`,
                })}
              </SummaryPill>
              <SummaryPill>
                <MdInfoOutline aria-hidden="true" />
                {t(warningSummaryKey, {
                  count: totals.warnings,
                  defaultValue: `${totals.warnings} ${
                    totals.warnings === 1 ? 'warning' : 'warnings'
                  }`,
                })}
              </SummaryPill>
            </HeaderMeta>
          </div>
        </HeadingGroup>
        <ScoreMeter
          role="meter"
          aria-label={t('publishReadiness.scoreLabel', {
            defaultValue: 'Publish score',
          })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readiness.score}
          status={readiness.status}
          style={scoreStyle}
        >
          <span>
            {readiness.score}%
            <small>
              {t('publishReadiness.scoreShortLabel', {
                defaultValue: 'score',
              })}
            </small>
          </span>
        </ScoreMeter>
      </Header>

      <Body>
        <Description>
          {t('publishReadiness.description', {
            defaultValue:
              'Uses deterministic proxy signals only. Semantic quality, factual strength and AI citation likelihood still need human or AI review.',
          })}
        </Description>

        <CategoryGrid>
          {CATEGORY_ORDER.map(category => {
            const checks = readiness.checks.filter(
              check => check.category === category
            );

            if (!checks.length) return null;

            const summary = getCategorySummary(checks);

            return (
              <Category key={category}>
                <CategoryHeader>
                  <CategoryTitle>
                    {t(`publishReadiness.categories.${category}`, {
                      defaultValue: CATEGORY_DEFAULTS[category],
                    })}
                  </CategoryTitle>
                  <CategoryProgress>
                    {t('publishReadiness.categoryProgress', {
                      passed: summary.passed,
                      total: summary.total,
                      defaultValue: `${summary.passed} of ${summary.total} passed`,
                    })}
                  </CategoryProgress>
                </CategoryHeader>
                <CheckList>
                  {checks.map(check => (
                    <CheckItem key={check.id}>
                      <CheckIcon status={check.status}>
                        {getCheckStatusIcon(check.status)}
                      </CheckIcon>
                      <CheckText>
                        {t(
                          `publishReadiness.checks.${check.id}.${check.status}`,
                          {
                            defaultValue:
                              CHECK_DEFAULTS[check.id]?.[check.status] ??
                              check.id,
                          }
                        )}
                      </CheckText>
                    </CheckItem>
                  ))}
                </CheckList>
              </Category>
            );
          })}
        </CategoryGrid>

        {aiReview && <PublishReadinessAIReview controller={aiReview} />}
      </Body>
    </Root>
  );
}

function getStatusLabel(status: PublishReadinessStatus): string {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'review':
      return 'Needs review';
    case 'risky':
      return 'Risky';
  }
}

function getStatusTone(status: PublishReadinessStatus, theme: Theme) {
  switch (status) {
    case 'ready':
      return {
        background: theme.palette.success.dark,
        border: theme.palette.success.dark,
        color: theme.palette.common.white,
      };
    case 'review':
      return {
        background: theme.palette.warning.main,
        border: theme.palette.warning.dark,
        color: theme.palette.common.black,
      };
    case 'risky':
      return {
        background: theme.palette.error.dark,
        border: theme.palette.error.dark,
        color: theme.palette.common.white,
      };
  }
}

function getCheckTone(status: PublishReadinessCheckStatus, theme: Theme) {
  switch (status) {
    case 'pass':
      return {
        background: theme.palette.success.dark,
        color: theme.palette.common.white,
      };
    case 'warning':
      return {
        background: theme.palette.warning.main,
        color: theme.palette.common.black,
      };
    case 'risk':
      return {
        background: theme.palette.error.dark,
        color: theme.palette.common.white,
      };
  }
}

function getTotals(checks: readonly PublishReadinessCheck[]) {
  return checks.reduce(
    (totals, check) => ({
      risks: totals.risks + Number(check.status === 'risk'),
      warnings: totals.warnings + Number(check.status === 'warning'),
    }),
    { risks: 0, warnings: 0 }
  );
}

function getCategorySummary(checks: readonly PublishReadinessCheck[]) {
  return {
    passed: checks.filter(check => check.status === 'pass').length,
    total: checks.length,
  };
}

function getStatusIcon(status: PublishReadinessStatus) {
  if (status === 'ready') return <MdCheckCircle aria-hidden="true" />;
  if (status === 'review') return <MdReportProblem aria-hidden="true" />;
  return <MdErrorOutline aria-hidden="true" />;
}

function getCheckStatusIcon(status: PublishReadinessCheckStatus) {
  if (status === 'pass') return <MdCheckCircle aria-hidden="true" />;
  if (status === 'warning') return <MdReportProblem aria-hidden="true" />;
  return <MdErrorOutline aria-hidden="true" />;
}
