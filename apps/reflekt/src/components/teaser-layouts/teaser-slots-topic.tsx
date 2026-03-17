import styled from '@emotion/styled';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  alignmentForTeaserBlock,
  isFilledTeaser,
  TeaserSlider,
  TeaserSlotsBlockTeasers as TeaserSlotsBlockTeasersDefault,
  TeaserSlotsBlockWrapper as TeaserSlotsBlockWrapperDefault,
} from '@wepublish/block-content/website';
import {
  SliderBallContainer,
  SliderWrapper,
  useSlidesPadding,
} from '@wepublish/block-content/website';
import {
  BuilderSlidesPerView,
  BuilderTeaserListBlockProps,
  BuilderTeaserSlotsBlockProps,
  useWebsiteBuilder,
} from '@wepublish/website/builder';
import { Maybe } from 'graphql/jsutils/Maybe';
import { allPass } from 'ramda';

import { ReflektBlockType } from '../block-styles/reflekt-block-styles';
import { TeaserWrapper } from '../teasers/reflekt-teaser';

export const isTeaserSlotsTopic = allPass([
  ({ blockStyle }: BuilderTeaserSlotsBlockProps) => {
    return (
      blockStyle === ReflektBlockType.TeaserRecherchen ||
      blockStyle === ReflektBlockType.TeaserNews
    );
  },
]);
export const TeaserSlotsTopicWrapper = styled(TeaserSlotsBlockWrapperDefault)`
  ${SliderWrapper} ${TeaserWrapper} {
    width: calc(100vw - 50px);
    //padding-right: 8px;
    //padding-left: 8px;
  }

  .keen-slider__slide {
    width: calc(100vw - 64px) !important;
    //min-width: calc(100vw - 64px) !important;
    //max-width: calc(100vw - 64px) !important;
  }

  ${SliderBallContainer} {
    display: none;
  }
`;

export const blockStyleByIndex = (
  index: number,
  count: number,
  blockStyle?: Maybe<string>
): ReflektBlockType | undefined => {
  return index < count - 1 ?
      (blockStyle as ReflektBlockType)
    : ReflektBlockType.TeaserMoreAbout;
};

export const TeaserSlotsTopic = ({
  blockStyle,
  className,
  teasers,
  title,
}: Pick<
  BuilderTeaserListBlockProps,
  'title' | 'teasers' | 'blockStyle' | 'className'
>) => {
  const {
    blocks: { Teaser },
  } = useWebsiteBuilder();

  const filledTeasers = teasers.filter(isFilledTeaser);
  const numColumns = 1;

  return (
    !!filledTeasers.length && (
      <TeaserSlotsTopicWrapper className={className}>
        <Typography variant={'teaserSlotsTitle'}>{title}</Typography>
        <TeaserSlider
          teasers={filledTeasers.filter(
            teaser => teaser?.__typename === 'ArticleTeaser'
          )}
          blockStyle={blockStyle}
          numColumns={numColumns}
          slidesPerViewConfig={{
            xs: 1.2,
            sm: 1.2,
            md: 3,
            lg: 3,
            xl: 3,
          }}
        />
        <Teaser
          key={filledTeasers.length - 1}
          index={filledTeasers.length - 1}
          teaser={filledTeasers[filledTeasers.length - 1]}
          alignment={alignmentForTeaserBlock(filledTeasers.length - 1, 3)}
          blockStyle={blockStyleByIndex(
            filledTeasers.length - 1,
            filledTeasers.length,
            blockStyle
          )}
        />
      </TeaserSlotsTopicWrapper>
    )
  );
};
