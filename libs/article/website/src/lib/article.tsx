import styled from '@emotion/styled';
import {
  BuilderArticleProps,
  PeerInformation,
  useWebsiteBuilder,
} from '@wepublish/website/builder';
import { Article as ArticleType, BlockContent } from '@wepublish/website/api';
import { ArticleListWrapper } from './article-list/article-list';
import { CommentListWrapper } from '@wepublish/comments/website';
import { ContentWrapper } from '@wepublish/content/website';
import { ArticleTrackingPixels } from './article-tracking-pixels';
import { Paywall } from '@wepublish/website/builder';
import { css, SerializedStyles } from '@emotion/react';
import {
  hasPaywalledArticleContent,
  paywalledContentClassName,
} from './article-seo';

export const ArticleInfoWrapper = styled('aside')`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-row-start: 2;
`;

export const defaultFadeoutStyles = css`
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: hidden;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 30%,
    rgba(0, 0, 0, 0) 100%
  );
`;

export const ArticleWrapper = styled(ContentWrapper)`
  ${({ theme }) => theme.breakpoints.up('md')} {
    & > :is(${ArticleListWrapper}, ${CommentListWrapper}) {
      grid-column: 2/12;
    }
  }
`;

export const ArticlePublicContentWrapper = styled('div')<{
  fadeout?: boolean;
  fadeoutStyles?: SerializedStyles;
}>`
  display: contents;

  ${({ fadeout, fadeoutStyles = defaultFadeoutStyles }) =>
    fadeout &&
    css`
      > :last-child {
        ${fadeoutStyles}
      }
    `}
`;

export const ArticlePaywalledContentWrapper = styled('section')<{
  hideContent?: boolean;
}>`
  display: contents;

  ${({ hideContent }) =>
    hideContent &&
    css`
      display: none;
    `}
`;

export function Article({
  className,
  data,
  children,
  showPaywall,
  hideContent,
  loading,
  error,
}: BuilderArticleProps) {
  const {
    ArticleSEO,
    ArticleAuthors,
    ArticleMeta,
    blocks: { Blocks },
  } = useWebsiteBuilder();

  const article = data?.article as ArticleType | undefined;
  const blocks = (article?.latest.blocks as BlockContent[] | undefined) ?? [];
  const hasPaywalledContent =
    article ? hasPaywalledArticleContent(article) : false;
  const hideContentAfter = Math.max(article?.paywall?.hideContentAfter ?? 0, 0);
  const publicBlocks =
    hasPaywalledContent ? blocks.slice(0, hideContentAfter) : blocks;
  const paywalledBlocks =
    hasPaywalledContent ? blocks.slice(hideContentAfter) : [];
  const fadeoutPublicContent =
    !!hideContent &&
    !!article?.paywall?.fadeout &&
    hasPaywalledContent &&
    publicBlocks.length > 0;

  return (
    <ArticleWrapper className={className}>
      {article && <ArticleSEO article={article} />}

      {article && !hasPaywalledContent && (
        <Blocks
          key={article.id}
          blocks={blocks}
          type="Article"
        />
      )}

      {article && hasPaywalledContent && (
        <>
          {publicBlocks.length > 0 && (
            <ArticlePublicContentWrapper fadeout={fadeoutPublicContent}>
              <Blocks
                key={`${article.id}-public`}
                blocks={publicBlocks}
                type="Article"
              />
            </ArticlePublicContentWrapper>
          )}

          <ArticlePaywalledContentWrapper
            className={paywalledContentClassName}
            hideContent={hideContent}
          >
            <Blocks
              key={`${article.id}-paywalled`}
              blocks={paywalledBlocks}
              type="Article"
            />
          </ArticlePaywalledContentWrapper>
        </>
      )}

      <ArticleInfoWrapper>
        {article && <ArticleAuthors article={article} />}
        {article && <ArticleMeta article={article} />}

        {data?.article?.peer && (
          <PeerInformation
            {...data.article.peer}
            originUrl={data.article.latest.canonicalUrl ?? undefined}
          />
        )}
      </ArticleInfoWrapper>

      {showPaywall && article?.paywall && (
        <Paywall
          {...article.paywall}
          hideContent={hideContent}
        />
      )}

      {children}

      <ArticleTrackingPixels trackingPixels={article?.trackingPixels} />
    </ArticleWrapper>
  );
}
