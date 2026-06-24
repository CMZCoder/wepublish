import styled from '@emotion/styled';
import { useState } from 'react';
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
import { ArticleMetadata } from './articleMetadataPanel';
import { PublishReadinessPanelWithAI } from './publishReadinessPanelWithAI';

const PublishDateSection = styled.div`
  align-items: start;
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const DateControl = styled.div`
  min-width: 0;

  .react-datepicker-wrapper,
  .react-datepicker__input-container,
  input {
    width: 100%;
  }
`;

const FirstPublished = styled.div`
  color: #555;
  font-size: 12px;
  line-height: 1.45;
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

export interface PublishArticlePanelProps {
  publishedAtDate?: Date;
  firstPublishedAtDate?: Date;
  metadata: ArticleMetadata;
  blocks?: readonly BlockValue[];

  onClose(): void;
  onConfirm(publishedAt: Date): void;
}

function PublishArticlePanel({
  publishedAtDate,
  firstPublishedAtDate,
  metadata,
  blocks,
  onClose,
  onConfirm,
}: PublishArticlePanelProps) {
  const now = new Date();
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(
    publishedAtDate ?? now
  );
  const { t } = useTranslation();

  return (
    <>
      <Modal.Header>
        <Modal.Title>{t('articleEditor.panels.publishArticle')}</Modal.Title>
      </Modal.Header>

      <PublishModalBody>
        <PublishLayout data-publish-modal-layout>
          <PublishSettings data-publish-modal-settings>
            {publishedAt && publishedAt > now && (
              <Message type="warning">
                {t('articleEditor.panels.articlePending', {
                  pendingPublishDate: publishedAt,
                })}
              </Message>
            )}

            <PublishDateSection>
              <DateControl>
                <DateTimePicker
                  dateTime={publishedAt}
                  label={t('articleEditor.panels.publishDate')}
                  changeDate={date => setPublishedAt(date)}
                />
              </DateControl>
              <FirstPublished>
                {firstPublishedAtDate ?
                  t('articleEditor.panels.firstPublishedAtDate', {
                    firstPublishedAtDate,
                  })
                : t('articleEditor.panels.notPublishedYet')}
              </FirstPublished>
            </PublishDateSection>

            <MetadataReview data-publish-metadata-review>
              <MetadataTitle>
                {t('articleEditor.panels.metadata')}
              </MetadataTitle>
              <DescriptionList>
                <DescriptionListItem label={t('articleEditor.panels.url')}>
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

                <DescriptionListItem label={t('articleEditor.panels.preTitle')}>
                  {metadata.preTitle || '-'}
                </DescriptionListItem>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.title')}
                  message={t('articleEditor.panels.enterTitle')}
                  messageType={InfoColor.warning}
                >
                  {metadata.title}
                </DescriptionListItemWithMessage>

                <DescriptionListItem label={t('articleEditor.panels.lead')}>
                  {metadata.lead || '-'}
                </DescriptionListItem>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.seoTitle')}
                  message={t('articleEditor.panels.enterSeoTitle')}
                  messageType={InfoColor.warning}
                >
                  {metadata.seoTitle}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.authors')}
                  message={t('articleEditor.panels.enterAuthors')}
                  messageType={InfoColor.warning}
                >
                  {metadata.authors.map(e => e.name).join(', ')}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.slug')}
                  message={t('articleEditor.panels.addSlug')}
                  messageType={InfoColor.error}
                >
                  {metadata.slug}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.tags')}
                  message={t('articleEditor.panels.enterTag')}
                  messageType={InfoColor.warning}
                >
                  {metadata.tags.join(', ')}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.image')}
                  message={t('articleEditor.panels.enterImage')}
                  messageType={InfoColor.warning}
                >
                  {metadata.image?.filename}
                </DescriptionListItemWithMessage>

                <DescriptionListItem
                  label={t('articleEditor.panels.breakingNews')}
                >
                  {metadata.breaking ?
                    t('articleEditor.panels.yes')
                  : t('articleEditor.panels.no')}
                </DescriptionListItem>
                <DescriptionListItem
                  label={t('articleEditor.panels.sharedWithPeers')}
                >
                  {metadata.shared ?
                    t('articleEditor.panels.yes')
                  : t('articleEditor.panels.no')}
                </DescriptionListItem>
                <DescriptionListItem
                  label={t('articleEditor.panels.hideAuthors')}
                >
                  {metadata.hideAuthor ?
                    t('articleEditor.panels.yes')
                  : t('articleEditor.panels.no')}
                </DescriptionListItem>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.socialMediaTitle')}
                  message={t('articleEditor.panels.enterSocialMediaTitle')}
                  messageType={InfoColor.warning}
                >
                  {metadata.socialMediaTitle}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.socialMediaDescription')}
                  message={t(
                    'articleEditor.panels.enterSocialMediaDescription'
                  )}
                  messageType={InfoColor.warning}
                >
                  {metadata.socialMediaDescription}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.socialMediaAuthors')}
                  message={t('articleEditor.panels.enterSocialMediaAuthors')}
                  messageType={InfoColor.warning}
                >
                  {metadata.socialMediaAuthors.map(e => e.name).join(', ')}
                </DescriptionListItemWithMessage>

                <DescriptionListItemWithMessage
                  label={t('articleEditor.panels.socialMediaImage')}
                  message={t(
                    'articleEditor.panels.enterSocialMediaDescription'
                  )}
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
                type: 'article',
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
          disabled={!publishedAt || !metadata.slug}
          onClick={() => {
            if (publishedAt) onConfirm(publishedAt);
          }}
        >
          {t('articleEditor.panels.confirm')}
        </Button>
        <Button
          appearance="subtle"
          onClick={() => onClose()}
        >
          {t('articleEditor.panels.close')}
        </Button>
      </Modal.Footer>
    </>
  );
}
const CheckedPermissionComponent = createCheckedPermissionComponent([
  'CAN_PUBLISH_ARTICLE',
])(PublishArticlePanel);
export { CheckedPermissionComponent as PublishArticlePanel };
