import styled from '@emotion/styled';
import { Button, CircularProgress } from '@mui/material';
import {
  MdAutoFixHigh,
  MdErrorOutline,
  MdInfoOutline,
  MdLightbulbOutline,
  MdReplay,
  MdWarningAmber,
} from 'react-icons/md';

export type AIReviewState =
  | 'unavailable'
  | 'ready'
  | 'loading'
  | 'suggestions'
  | 'error';

export type AIReviewSuggestionCategory =
  | 'lead'
  | 'seo-social'
  | 'aeo-geo'
  | 'editorial-risk';

export interface AIReviewSuggestion {
  readonly id: string;
  readonly category: AIReviewSuggestionCategory;
  readonly title: string;
  readonly currentValue?: string | null;
  readonly suggestedValue?: string | null;
  readonly rationale: string;
  readonly confidence: 'low' | 'medium' | 'high';
}

export interface PublishReadinessAIReviewController {
  readonly state: AIReviewState;
  readonly message?: string;
  readonly summary?: string;
  readonly suggestions?: readonly AIReviewSuggestion[];
  readonly warnings?: readonly string[];
  readonly onReview?: () => void | Promise<void>;
}

export interface PublishReadinessAIReviewProps {
  readonly controller: PublishReadinessAIReviewController;
}

const CATEGORY_LABELS: Record<AIReviewSuggestionCategory, string> = {
  lead: 'Lead and answer',
  'seo-social': 'SEO and social',
  'aeo-geo': 'AEO/GEO clarity',
  'editorial-risk': 'Editorial risks',
};

const CATEGORY_ORDER: AIReviewSuggestionCategory[] = [
  'lead',
  'seo-social',
  'aeo-geo',
  'editorial-risk',
];

const Root = styled.section`
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  display: grid;
  gap: 12px;
  padding: 12px;
`;

const Header = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;

  @container (max-width: 420px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const Heading = styled.div`
  display: grid;
  gap: 5px;
  grid-template-columns: auto 1fr;
  min-width: 0;
`;

const IconBadge = styled.span<{ tone?: 'info' | 'error' | 'warning' }>`
  align-items: center;
  background: ${({ theme, tone }) =>
    tone === 'error' ? theme.palette.error.dark
    : tone === 'warning' ? theme.palette.warning.main
    : theme.palette.primary.dark};
  border-radius: 8px;
  color: ${({ theme, tone }) =>
    tone === 'warning' ?
      theme.palette.common.black
    : theme.palette.common.white};
  display: inline-flex;
  height: 28px;
  justify-content: center;
  margin-top: 1px;
  width: 28px;

  svg {
    color: currentColor;
    height: 17px;
    width: 17px;
  }
`;

const TitleGroup = styled.div`
  min-width: 0;
`;

const Title = styled.h4`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.3;
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  margin: 3px 0 0;
`;

const ActionButton = styled(Button)`
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  min-height: 32px;
  white-space: nowrap;
`;

const StatusText = styled.p<{ tone?: 'error' | 'warning' }>`
  align-items: flex-start;
  background: ${({ theme, tone }) =>
    tone === 'error' ? theme.palette.error.light
    : tone === 'warning' ? theme.palette.warning.light
    : theme.palette.grey[50]};
  border: 1px solid
    ${({ theme, tone }) =>
      tone === 'error' ? theme.palette.error.dark
      : tone === 'warning' ? theme.palette.warning.dark
      : theme.palette.grey[200]};
  border-radius: 8px;
  color: ${({ theme, tone }) =>
    tone === 'error' ? theme.palette.error.dark : theme.palette.text.primary};
  display: grid;
  font-size: 12px;
  gap: 8px;
  grid-template-columns: auto 1fr;
  line-height: 1.45;
  margin: 0;
  padding: 9px 10px;

  svg {
    color: currentColor;
    height: 17px;
    margin-top: 1px;
    width: 17px;
  }
`;

const SuggestionGroups = styled.div`
  display: grid;
  gap: 10px;
`;

const Group = styled.div`
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  overflow: hidden;
`;

const GroupTitle = styled.h5`
  background: ${({ theme }) => theme.palette.grey[50]};
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[200]};
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0;
  padding: 9px 10px;
`;

const SuggestionList = styled.ul`
  display: grid;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0 10px;
`;

const SuggestionItem = styled.li`
  display: grid;
  gap: 6px;
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.palette.grey[100]};
  }
`;

const SuggestionTitle = styled.strong`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 12px;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const SuggestionBody = styled.p`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  overflow-wrap: anywhere;
`;

const SuggestedValue = styled.blockquote`
  background: ${({ theme }) => theme.palette.primary.light}17;
  border-left: 3px solid ${({ theme }) => theme.palette.primary.dark};
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  overflow-wrap: anywhere;
  padding: 8px 10px;
`;

const Meta = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
`;

const WarningList = styled.ul`
  display: grid;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const WarningItem = styled.li`
  align-items: flex-start;
  background: ${({ theme }) => theme.palette.warning.light};
  border: 1px solid ${({ theme }) => theme.palette.warning.dark};
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.common.black};
  display: grid;
  font-size: 12px;
  gap: 8px;
  grid-template-columns: auto 1fr;
  line-height: 1.45;
  padding: 8px 10px;

  svg {
    color: currentColor;
    height: 17px;
    margin-top: 1px;
    width: 17px;
  }
`;

export function PublishReadinessAIReview({
  controller,
}: PublishReadinessAIReviewProps) {
  const isLoading = controller.state === 'loading';
  const isError = controller.state === 'error';
  const isUnavailable = controller.state === 'unavailable';
  const suggestions = controller.suggestions ?? [];
  const warnings = controller.warnings ?? [];

  return (
    <Root
      aria-label="AI review"
      aria-busy={isLoading ? 'true' : undefined}
    >
      <Header>
        <Heading>
          <IconBadge
            aria-hidden="true"
            tone={
              isError ? 'error'
              : isUnavailable ?
                'warning'
              : 'info'
            }
          >
            {isError ?
              <MdErrorOutline />
            : isUnavailable ?
              <MdInfoOutline />
            : <MdAutoFixHigh />}
          </IconBadge>
          <TitleGroup>
            <Title>AI review</Title>
            <Description>
              Editorial suggestions for SEO, AEO and GEO signals. Deterministic
              checks still work and human review stays required.
            </Description>
          </TitleGroup>
        </Heading>

        {renderAction(controller)}
      </Header>

      {renderStatus(controller)}

      {controller.summary && (
        <StatusText>
          <MdLightbulbOutline aria-hidden="true" />
          <span>{controller.summary}</span>
        </StatusText>
      )}

      {!!suggestions.length && (
        <SuggestionGroups>
          {CATEGORY_ORDER.map(category => {
            const categorySuggestions = suggestions.filter(
              suggestion => suggestion.category === category
            );

            if (!categorySuggestions.length) return null;

            return (
              <Group key={category}>
                <GroupTitle>{CATEGORY_LABELS[category]}</GroupTitle>
                <SuggestionList>
                  {categorySuggestions.map(suggestion => (
                    <SuggestionItem key={suggestion.id}>
                      <SuggestionTitle>{suggestion.title}</SuggestionTitle>
                      {suggestion.currentValue && (
                        <SuggestionBody>
                          Current: {suggestion.currentValue}
                        </SuggestionBody>
                      )}
                      {suggestion.suggestedValue && (
                        <SuggestedValue>
                          {suggestion.suggestedValue}
                        </SuggestedValue>
                      )}
                      <SuggestionBody>{suggestion.rationale}</SuggestionBody>
                      <Meta>Confidence: {suggestion.confidence}</Meta>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              </Group>
            );
          })}
        </SuggestionGroups>
      )}

      {!!warnings.length && (
        <WarningList aria-label="AI review warnings">
          {warnings.map(warning => (
            <WarningItem key={warning}>
              <MdWarningAmber aria-hidden="true" />
              <span>{warning}</span>
            </WarningItem>
          ))}
        </WarningList>
      )}
    </Root>
  );
}

function renderAction(controller: PublishReadinessAIReviewController) {
  if (controller.state === 'unavailable') return null;

  if (controller.state === 'loading') {
    return (
      <ActionButton
        variant="contained"
        color="primary"
        disabled
        startIcon={
          <CircularProgress
            color="inherit"
            size={14}
          />
        }
      >
        Reviewing
      </ActionButton>
    );
  }

  if (controller.state === 'error') {
    return (
      <ActionButton
        variant="contained"
        color="primary"
        onClick={controller.onReview}
        startIcon={<MdReplay />}
      >
        Retry AI review
      </ActionButton>
    );
  }

  return (
    <ActionButton
      variant="contained"
      color="primary"
      onClick={controller.onReview}
      startIcon={<MdAutoFixHigh />}
    >
      Run AI review
    </ActionButton>
  );
}

function renderStatus(controller: PublishReadinessAIReviewController) {
  if (controller.state === 'ready' || controller.state === 'suggestions') {
    return null;
  }

  if (controller.state === 'loading') {
    return (
      <StatusText>
        <MdInfoOutline aria-hidden="true" />
        <span>Requesting structured editorial suggestions.</span>
      </StatusText>
    );
  }

  if (controller.state === 'error') {
    return (
      <StatusText tone="error">
        <MdErrorOutline aria-hidden="true" />
        <span>
          {controller.message ??
            'AI review failed. Deterministic checks remain available.'}
        </span>
      </StatusText>
    );
  }

  return (
    <StatusText tone="warning">
      <MdInfoOutline aria-hidden="true" />
      <span>
        {controller.message ??
          'Configure an AI provider to run editorial suggestions.'}
      </span>
    </StatusText>
  );
}
