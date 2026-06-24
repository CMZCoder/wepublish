import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Message, Modal } from 'rsuite';

import {
  createCheckedPermissionComponent,
  DateTimePicker,
  DescriptionList,
  DescriptionListItem,
  DescriptionListItemWithMessage,
  InfoColor,
} from '../atoms';
import { BlockValue } from '../blocks/types';
import { PageMetadata } from './pageMetadataPanel';
import { PublishReadinessPanelWithAI } from './publishReadinessPanelWithAI';

const PublishDateSection = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
`;

const DateControl = styled.div`
  min-width: 0;

  .react-datepicker-wrapper,
  .react-datepicker__input-container,
  input {
    width: 100%;
  }
`;

const PublishModalBody = styled(Modal.Body)`
  margin-left: -20px;
  margin-right: -20px;
  max-height: min(74vh, 760px);
  padding: 0 18px 72px 20px;
  scrollbar-gutter: stable;
`;

const PublishLayout = styled.div`
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  padding: 4px 4px 10px 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PublishSettings = styled.section`
  align-content: start;
  display: grid;
  gap: 16px;
  min-width: 0;
`;

const ReadinessRail = styled.aside`
  align-self: start;
  min-width: 0;
  position: sticky;
  top: 0;

  @media (max-width: 900px) {
    position: static;
  }
`;

const MetadataReview = styled.section`
  background: #fff;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  min-width: 0;
  padding: 12px;

  dl {
    display: grid;
    gap: 0;
    margin: 0;
  }

  dl > div {
    align-items: flex-start;
    border-top: 1px solid #f1f1f4;
    display: grid;
    gap: 12px;
    grid-template-columns: 104px minmax(0, 1fr);
    margin: 0;
    padding: 9px 0;
  }

  dl > div:first-of-type {
    border-top: 0;
    padding-top: 0;
  }

  dt {
    color: #6f6f78;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
  }

  dd {
    color: #1f2933;
    font-size: 12px;
    line-height: 1.45;
    margin-left: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    text-align: right;
  }

  @media (max-width: 520px) {
    dl > div {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    dd {
      text-align: left;
    }
  }
`;

const MetadataTitle = styled.h3`
  color: #1f2933;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
  margin: 0 0 8px;
`;

export interface PublishPagePanelProps {
  publishedAtDate?: Date;
  metadata: PageMetadata;
  blocks?: readonly BlockValue[];

  onClose(): void;
  onConfirm(publishedAt: Date): void;
}

function PublishPagePanel({
  publishedAtDate,
  metadata,
  blocks,
  onClose,
  onConfirm,
}: PublishPagePanelProps) {
  const now = new Date();
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(
    publishedAtDate ?? now
  );
  const { t } = useTranslation();

  return (
    <>
      <Modal.Header>
        <Modal.Title>{t('pageEditor.panels.publishPage')}</Modal.Title>
      </Modal.Header>

      <PublishModalBody>
        <PublishLayout data-publish-modal-layout>
          <PublishSettings data-publish-modal-settings>
            {publishedAt && publishedAt > now && (
              <Message type="warning">
                {t('pageEditor.panels.pagePending', {
                  pendingPublishDate: publishedAt,
                })}
              </Message>
            )}

            <PublishDateSection>
              <DateControl>
                <DateTimePicker
                  dateTime={publishedAt}
                  label={t('pageEditor.panels.publishDate')}
                  changeDate={date => setPublishedAt(date)}
                />
              </DateControl>
            </PublishDateSection>

            <MetadataReview data-publish-metadata-review>
              <MetadataTitle>{t('pageEditor.panels.metadata')}</MetadataTitle>
              <DescriptionList>
                <DescriptionListItem label={t('pageEditor.panels.url')}>
                  {metadata?.url ?
                    <a
                      href={metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {metadata.url}
                    </a>
                  : '-'}
                </DescriptionListItem>
                <DescriptionListItemWithMessage
                  label={t('pageEditor.panels.title')}
                  message={t('pageEditor.panels.enterTitle')}
                  messageType={InfoColor.warning}
                >
                  {metadata.title}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('pageEditor.panels.description')}
                  message={t('pageEditor.panels.enterDescription')}
                  messageType={InfoColor.warning}
                >
                  {metadata.description}
                </DescriptionListItemWithMessage>

                <DescriptionListItem label={t('pageEditor.panels.slug')}>
                  {metadata.slug || '-'}
                </DescriptionListItem>

                <DescriptionListItem label={t('pageEditor.panels.tags')}>
                  {metadata.tags.join(', ') || '-'}
                </DescriptionListItem>

                <DescriptionListItemWithMessage
                  label={t('pageEditor.panels.image')}
                  message={t('pageEditor.panels.enterImage')}
                  messageType={InfoColor.warning}
                >
                  {metadata.image?.filename}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('pageEditor.panels.socialMediaTitle')}
                  message={t('pageEditor.panels.enterSocialMediaTitle')}
                  messageType={InfoColor.warning}
                >
                  {metadata.socialMediaTitle}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('pageEditor.panels.socialMediaDescription')}
                  message={t('pageEditor.panels.enterSocialMediaDescription')}
                  messageType={InfoColor.warning}
                >
                  {metadata.socialMediaDescription}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('pageEditor.panels.socialMediaImage')}
                  message={t('pageEditor.panels.enterSocialMediaDescription')}
                  messageType={InfoColor.warning}
                >
                  {metadata.socialMediaImage?.filename}
                </DescriptionListItemWithMessage>
              </DescriptionList>
            </MetadataReview>
          </PublishSettings>

          <ReadinessRail data-publish-readiness-rail>
            <PublishReadinessPanelWithAI
              variant="embedded"
              input={{
                type: 'page',
                metadata,
                blocks,
                publishedAt,
              }}
            />
          </ReadinessRail>
        </PublishLayout>
      </PublishModalBody>

      <Modal.Footer>
        <Button
          appearance="primary"
          disabled={!publishedAt}
          onClick={() => {
            if (publishedAt) onConfirm(publishedAt);
          }}
        >
          {t('pageEditor.panels.confirm')}
        </Button>
        <Button
          appearance="subtle"
          onClick={() => onClose()}
        >
          {t('pageEditor.panels.close')}
        </Button>
      </Modal.Footer>
    </>
  );
}
const CheckedPermissionComponent = createCheckedPermissionComponent([
  'CAN_PUBLISH_PAGE',
])(PublishPagePanel);
export { CheckedPermissionComponent as PublishPagePanel };
