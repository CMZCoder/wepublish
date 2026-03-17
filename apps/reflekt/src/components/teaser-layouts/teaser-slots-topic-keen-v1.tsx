import styled from '@emotion/styled';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  alignmentForTeaserBlock,
  isFilledTeaser,
  TeaserSlotsBlockTeasers as TeaserSlotsBlockTeasersDefault,
  TeaserSlotsBlockWrapper as TeaserSlotsBlockWrapperDefault,
} from '@wepublish/block-content/website';
import {
  SliderInnerContainer,
  SliderTitle,
  SlidesContainer as SlidesContainerDefault,
  useSlidesPadding,
} from '@wepublish/block-content/website';
import {
  BuilderBlockStyleProps,
  BuilderSlidesPerView,
  BuilderTeaserListBlockProps,
  BuilderTeaserSlotsBlockProps,
  useWebsiteBuilder,
} from '@wepublish/website/builder';
import { Maybe } from 'graphql/jsutils/Maybe';
import { useKeenSlider } from 'keen-slider/react';
import { allPass } from 'ramda';
import { useEffect, useState } from 'react';

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
export const TeaserSlotsTopicWrapper = styled(TeaserSlotsBlockWrapperDefault)``;

export const TeaserSlotsTopicTeasers = styled(TeaserSlotsBlockTeasersDefault)``;

export const blockStyleByIndex = (
  index: number,
  count: number,
  blockStyle?: Maybe<string>
): ReflektBlockType | undefined => {
  return index < count - 1 ?
      (blockStyle as ReflektBlockType)
    : ReflektBlockType.TeaserMoreAbout;
};

export const useSlidesPerView = ({
  xs = 1.1,
  sm = 2,
  md = 2.2,
  lg = 3,
  xl = 3,
}: BuilderSlidesPerView = {}) => {
  const theme = useTheme();

  const smQuery = useMediaQuery(theme.breakpoints.up('sm'), {
    ssrMatchMedia: () => ({ matches: false }),
  });

  const mdQuery = useMediaQuery(theme.breakpoints.up('md'), {
    ssrMatchMedia: () => ({ matches: false }),
  });

  const lgQuery = useMediaQuery(theme.breakpoints.up('lg'), {
    ssrMatchMedia: () => ({ matches: false }),
  });

  const xlQuery = useMediaQuery(theme.breakpoints.up('xl'), {
    ssrMatchMedia: () => ({ matches: false }),
  });

  if (xlQuery) {
    return xl;
  }

  if (lgQuery) {
    return lg;
  }

  if (mdQuery) {
    return md;
  }

  if (smQuery) {
    return sm;
  }

  return xs;
};

export const SlidesContainer = styled(SlidesContainerDefault)`
  padding-left: 16px;

  ${TeaserWrapper} {
    //width: calc(100vw - 50px);
    padding-right: 8px;
    padding-left: 8px;
  }

  .keen-slider__slide {
    //min-width: 100% !important;
    //max-width: 100% !important;
    //width: calc(100vw - 64px) !important;
    //min-width: calc(100vw - 64px) !important;
    //max-width: calc(100vw - 64px) !important;
  }
`;

export const TeaserSlotsTopic = ({
  blockStyle,
  className,
  teasers,
  slidesPerViewConfig = {},
  ...props
}: BuilderBlockStyleProps['TeaserSlider']) => {
  const {
    blocks: { Teaser },
  } = useWebsiteBuilder();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const filledTeasers = teasers.filter(isFilledTeaser);

  const slidesPerView = useSlidesPerView(slidesPerViewConfig);
  const slidePadding = useSlidesPadding();
  const ksOptions = {
    mode: 'free-snap',
    loop: true,
    slides: {
      origin: 'center',
      perView: slidesPerView,
      spacing: 0,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  };
  const [ref, sliderRef] = useKeenSlider(ksOptions);

  useEffect(() => {
    sliderRef.current?.update(ksOptions);
  }, [filledTeasers]);

  return (
    !!filledTeasers.length && (
      <TeaserSlotsTopicWrapper className={className}>
        {(props as BuilderTeaserListBlockProps).title && (
          <SliderTitle>
            <Typography variant={'teaserSlotsTitle'}>
              {(props as BuilderTeaserListBlockProps).title}
            </Typography>
          </SliderTitle>
        )}

        <SliderInnerContainer>
          <SlidesContainer
            ref={ref}
            className="keen-slider"
          >
            {filledTeasers
              .filter(teaser => teaser?.__typename === 'ArticleTeaser')
              .map((teaser: any, index: number) => (
                <div
                  key={index}
                  className="keen-slider__slide"
                >
                  <Teaser
                    key={index}
                    index={index}
                    teaser={teaser}
                    alignment={alignmentForTeaserBlock(index, 3)}
                    blockStyle={blockStyleByIndex(
                      index,
                      filledTeasers.length,
                      blockStyle
                    )}
                  />
                </div>
              ))}
          </SlidesContainer>
        </SliderInnerContainer>
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
