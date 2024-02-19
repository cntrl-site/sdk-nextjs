import { FC, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { ArticleItemType, getLayoutStyles, VideoItem as TVideoItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useRegisterResize } from "../../common/useRegisterResize";
import { rangeMap } from '../../utils/rangeMap';
import { ArticleRectContext } from '../../provider/ArticleRectContext';
import { useLayoutContext } from '../useLayoutContext';

// To prevent video behaviour that drops to the first frame
// when close to the end
const SCROLL_TIME_SHIFT = 0.1;

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth, strokeColor, opacity, blur } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const articleRectObserver = useContext(ArticleRectContext);
  const rafId = useRef<number | undefined>();
  const layoutId = useLayoutContext();
  const scrollPlayback = item.layoutParams[layoutId!].scrollPlayback

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !scrollPlayback) {
      video?.play();
      return;
    }
    video?.pause();
    const scrollVideo = () => {
      rafId.current = window.requestAnimationFrame(scrollVideo);
      if (!articleRectObserver) return;
      const scrollPos = articleRectObserver.getSectionScroll(sectionId);
      if (!video.duration) return;
      const time = rangeMap(scrollPos, scrollPlayback.from, scrollPlayback.to, 0, video.duration, true);
      if (scrollPos > scrollPlayback.from && scrollPos < scrollPlayback.to) {
        if (toFixed(video.currentTime) === toFixed(time - SCROLL_TIME_SHIFT)) return;
        video.currentTime = Math.max(0, time - SCROLL_TIME_SHIFT);
      }
    };
    rafId.current = window.requestAnimationFrame(scrollVideo);

    return () => {
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = undefined;
      }
    }
  }, [scrollPlayback]);

  useRegisterResize(ref, onResize);
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`video-wrapper-${item.id}`}
        ref={setRef}
        style={{
          opacity: `${opacity}`,
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * 100}vw)`
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`video video-${item.id}`}
          style={{
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            borderColor: `${borderColor.toCss()}`
          }}
        >
          <source src={item.commonParams.url} />
        </video>
      </div>
      <JSXStyle id={id}>{`
        @supports not (color: oklch(42% 0.3 90 / 1)) {
          .video-${item.id} {
            border-color: ${borderColor.fmt('rgba')};
          }
        }
        .video-wrapper-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          opacity: ${opacity};
        }
        .video {
          width: 100%;
          height: 100%;
          opacity: 1;
          object-fit: cover;
          pointer-events: none;
          overflow: hidden;
          border-style: solid;
        }
        .video-${item.id} {
          border-color: ${strokeColor};
        }
        ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .video-wrapper-${item.id} {
              transition: ${getTransitions<ArticleItemType.Video>(['angle', 'opacity', 'blur'], hoverParams)};
            }
            .video-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Video>(['angle', 'opacity', 'blur'], hoverParams)}
            }
            .video-${item.id} {
              transition: ${getTransitions<ArticleItemType.Video>(['strokeWidth', 'radius', 'strokeColor'], hoverParams)};
            }
            .video-wrapper-${item.id}:hover .video {
              ${getHoverStyles<ArticleItemType.Video>(['strokeWidth', 'radius', 'strokeColor'], hoverParams)}
            }
          `);
        })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};

function toFixed(num: number) {
  return Number(num.toFixed(5));
}
