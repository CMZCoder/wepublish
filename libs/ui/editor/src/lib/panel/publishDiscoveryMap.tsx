import styled from '@emotion/styled';
import type { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  MdLink,
  MdLock,
  MdLockOpen,
  MdQuestionAnswer,
  MdSearch,
} from 'react-icons/md';

import type {
  PublishReadinessCheck,
  PublishReadinessCheckStatus,
  PublishReadinessInput,
  PublishReadinessResult,
} from './publishReadiness';

interface PublishDiscoveryMapProps {
  readonly input?: PublishReadinessInput;
  readonly readiness: PublishReadinessResult;
}

const DiscoveryMap = styled.section`
  background: ${({ theme }) => theme.palette.grey[50]};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  display: grid;
  gap: 10px;
  padding: 12px;
`;

const DiscoveryHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  min-width: 0;

  @container (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
`;

const DiscoveryTitle = styled.h4`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0;
`;

const DiscoveryDescription = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
`;

const DiscoveryGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @container (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @container (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const DiscoveryCard = styled.article<{ status: PublishReadinessCheckStatus }>`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-left: 4px solid
    ${({ status, theme }) => getDiscoveryTone(status, theme).background};
  border-radius: 8px;
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
`;

const DiscoveryCardHeader = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 8px;
  grid-template-columns: 24px 1fr;
  min-width: 0;
`;

const DiscoveryIcon = styled.span<{ status: PublishReadinessCheckStatus }>`
  align-items: center;
  background: ${({ status, theme }) =>
    getDiscoveryTone(status, theme).background};
  border-radius: 7px;
  color: ${({ status, theme }) => getDiscoveryTone(status, theme).color};
  display: inline-flex;
  height: 24px;
  justify-content: center;
  width: 24px;

  svg {
    color: currentColor;
    height: 15px;
    width: 15px;
  }
`;

const DiscoveryChannelTitle = styled.h5`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0;
  overflow-wrap: anywhere;
`;

const DiscoveryChannelState = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 11px;
  font-weight: 700;
  line-height: 1.25;
  margin: 2px 0 0;
  overflow-wrap: anywhere;
`;

const DiscoveryEvidence = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  overflow-wrap: anywhere;
`;

const DISCOVERY_CHANNEL_CHECKS = {
  search: [
    'seo-title-length',
    'description-length',
    'social-image',
    'canonical-url',
  ],
  answers: ['opening-context-signals', 'headings', 'named-signals'],
  citations: [
    'visible-author',
    'publish-date',
    'source-links',
    'image-context',
  ],
} as const;

type DiscoveryChannel =
  | {
      readonly id: 'search';
      readonly status: PublishReadinessCheckStatus;
      readonly ready: number;
      readonly total: number;
    }
  | {
      readonly id: 'answers';
      readonly status: PublishReadinessCheckStatus;
      readonly ready: number;
      readonly total: number;
    }
  | {
      readonly id: 'citations';
      readonly status: PublishReadinessCheckStatus;
      readonly ready: number;
      readonly total: number;
    }
  | {
      readonly id: 'access';
      readonly status: PublishReadinessCheckStatus;
      readonly accessModel:
        | 'paywalled'
        | 'freeArticle'
        | 'openPage'
        | 'unknown';
    };

export function PublishDiscoveryMap({
  input,
  readiness,
}: PublishDiscoveryMapProps) {
  const { t } = useTranslation();
  const discoveryChannels = getDiscoveryChannels(readiness, input);

  return (
    <DiscoveryMap aria-labelledby="publish-readiness-discovery-map">
      <DiscoveryHeader>
        <DiscoveryTitle id="publish-readiness-discovery-map">
          {t('publishReadiness.discovery.title', {
            defaultValue: 'Discovery map',
          })}
        </DiscoveryTitle>
        <DiscoveryDescription>
          {t('publishReadiness.discovery.description', {
            defaultValue:
              'Shows how observable signals support search snippets, answer surfaces, citation trails and access clarity.',
          })}
        </DiscoveryDescription>
      </DiscoveryHeader>
      <DiscoveryGrid>
        {discoveryChannels.map(channel => (
          <DiscoveryCard
            key={channel.id}
            status={channel.status}
          >
            <DiscoveryCardHeader>
              <DiscoveryIcon status={channel.status}>
                {getDiscoveryIcon(channel)}
              </DiscoveryIcon>
              <div>
                <DiscoveryChannelTitle>
                  {t(
                    `publishReadiness.discovery.channels.${channel.id}.title`,
                    {
                      defaultValue: getDiscoveryTitle(channel),
                    }
                  )}
                </DiscoveryChannelTitle>
                <DiscoveryChannelState>
                  {getDiscoveryState(channel, t)}
                </DiscoveryChannelState>
              </div>
            </DiscoveryCardHeader>
            <DiscoveryEvidence>
              {getDiscoveryEvidence(channel, t)}
            </DiscoveryEvidence>
          </DiscoveryCard>
        ))}
      </DiscoveryGrid>
    </DiscoveryMap>
  );
}

function getDiscoveryChannels(
  readiness: PublishReadinessResult,
  input: PublishReadinessInput | undefined
): DiscoveryChannel[] {
  const searchChecks = getChecksById(
    readiness.checks,
    DISCOVERY_CHANNEL_CHECKS.search
  );
  const answerChecks = getChecksById(
    readiness.checks,
    DISCOVERY_CHANNEL_CHECKS.answers
  );
  const citationChecks = getChecksById(
    readiness.checks,
    DISCOVERY_CHANNEL_CHECKS.citations
  );
  const accessModel =
    input?.type === 'article' && input.metadata.paywall ? 'paywalled'
    : input?.type === 'article' ? 'freeArticle'
    : input?.type === 'page' ? 'openPage'
    : 'unknown';

  return [
    {
      id: 'search',
      status: getDiscoveryChannelStatus(searchChecks),
      ready: getPassedCount(searchChecks),
      total: searchChecks.length,
    },
    {
      id: 'answers',
      status: getDiscoveryChannelStatus(answerChecks),
      ready: getPassedCount(answerChecks),
      total: answerChecks.length,
    },
    {
      id: 'citations',
      status: getDiscoveryChannelStatus(citationChecks),
      ready: getPassedCount(citationChecks),
      total: citationChecks.length,
    },
    {
      id: 'access',
      status: accessModel === 'unknown' ? 'warning' : 'pass',
      accessModel,
    },
  ];
}

function getChecksById(
  checks: readonly PublishReadinessCheck[],
  ids: readonly string[]
) {
  return ids
    .map(id => checks.find(check => check.id === id))
    .filter((check): check is PublishReadinessCheck => Boolean(check));
}

function getDiscoveryChannelStatus(
  checks: readonly PublishReadinessCheck[]
): PublishReadinessCheckStatus {
  if (!checks.length) return 'warning';
  if (checks.some(check => check.status === 'risk')) return 'risk';
  if (checks.some(check => check.status === 'warning')) return 'warning';
  return 'pass';
}

function getPassedCount(checks: readonly PublishReadinessCheck[]) {
  return checks.filter(check => check.status === 'pass').length;
}

function getDiscoveryIcon(channel: DiscoveryChannel) {
  switch (channel.id) {
    case 'search':
      return <MdSearch aria-hidden="true" />;
    case 'answers':
      return <MdQuestionAnswer aria-hidden="true" />;
    case 'citations':
      return <MdLink aria-hidden="true" />;
    case 'access':
      return channel.accessModel === 'paywalled' ?
          <MdLock aria-hidden="true" />
        : <MdLockOpen aria-hidden="true" />;
  }
}

function getDiscoveryTitle(channel: DiscoveryChannel) {
  switch (channel.id) {
    case 'search':
      return 'Search preview';
    case 'answers':
      return 'Answer readiness';
    case 'citations':
      return 'AI citation trail';
    case 'access':
      return 'Access model';
  }
}

function getDiscoveryState(
  channel: DiscoveryChannel,
  t: ReturnType<typeof useTranslation>['t']
) {
  if (channel.id === 'access') {
    return t(`publishReadiness.discovery.access.${channel.accessModel}`, {
      defaultValue:
        channel.accessModel === 'paywalled' ? 'Paywalled article'
        : channel.accessModel === 'freeArticle' ? 'Free article'
        : channel.accessModel === 'openPage' ? 'Open page'
        : 'Access not supplied',
    });
  }

  const key =
    channel.status === 'pass' ? 'ready'
    : channel.status === 'warning' ? 'review'
    : 'risk';

  return t(`publishReadiness.discovery.state.${key}`, {
    defaultValue:
      channel.status === 'pass' ? 'Ready'
      : channel.status === 'warning' ? 'Needs work'
      : 'At risk',
  });
}

function getDiscoveryEvidence(
  channel: DiscoveryChannel,
  t: ReturnType<typeof useTranslation>['t']
) {
  if (channel.id === 'access') {
    return t(
      `publishReadiness.discovery.accessEvidence.${channel.accessModel}`,
      {
        defaultValue:
          channel.accessModel === 'paywalled' ?
            'The article uses a paywall selection; public markup can identify gated sections.'
          : channel.accessModel === 'freeArticle' ?
            'The article is open; no gated-content marker is expected.'
          : channel.accessModel === 'openPage' ?
            'The page is open content; no article paywall signal is expected.'
          : 'Content metadata was not supplied, so access cannot be inferred.',
      }
    );
  }

  if (channel.total === 0) {
    return t('publishReadiness.discovery.noSignals', {
      defaultValue: 'No signals available for this surface.',
    });
  }

  return t('publishReadiness.discovery.signalProgress', {
    ready: channel.ready,
    total: channel.total,
    defaultValue: `${channel.ready} of ${channel.total} signals ready`,
  });
}

function getDiscoveryTone(status: PublishReadinessCheckStatus, theme: Theme) {
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
