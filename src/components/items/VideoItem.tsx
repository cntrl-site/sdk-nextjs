import { FC, useId, useMemo, useRef, useState } from 'react';
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
import { useLayoutContext } from '../useLayoutContext';
import { ScrollPlaybackVideo } from '../ScrollPlaybackVideo';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth, strokeColor, opacity, blur } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => strokeColor ? CntrlColor.parse(strokeColor) : undefined, [strokeColor]);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const layoutId = useLayoutContext();
  const scrollPlayback = layoutId ? item.layoutParams[layoutId].scrollPlayback : null;
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state.hover];
  const hasScrollPlayback = scrollPlayback !== null;
  useRegisterResize(ref, onResize);
  const inlineStyles = {
    ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
    ...(strokeWidth !== undefined  ? { borderWidth: `${strokeWidth * 100}vw` } : {}),
    ...(borderColor ? { borderColor: `${borderColor.toCss()}` } : {})
  };

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`video-wrapper-${item.id}`}
        ref={setRef}
        style={{
          ...(opacity !== undefined ? { opacity: `${opacity}` } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
        }}
      >
        {hasScrollPlayback ? (
          <ScrollPlaybackVideo
            sectionId={sectionId}
            src={item.commonParams.url}
            playbackParams={scrollPlayback}
            style={inlineStyles}
            className={`video video-playback-wrapper video-${item.id}`}
          />
          ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className={`video video-${item.id}`}
            style={inlineStyles}
          >
            <source src={item.commonParams.url} />
          </video>
        )}
      </div>
      <JSXStyle id={id}>{`
        .video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
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
        .video-playback-wrapper {
          display: flex;
          justify-content: center;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, hoverParams]) => {
          return (`
            .video-wrapper-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              transition: ${getTransitions<ArticleItemType.Video>(['angle', 'opacity', 'blur'], hoverParams)};
            }
            .video-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Video>(['angle', 'opacity', 'blur'], hoverParams)};
            }
            .video-${item.id} {
              border-color: ${CntrlColor.parse(layoutParams.strokeColor).fmt('rgba')};
              border-radius: ${layoutParams.radius * 100}vw;
              border-width: ${layoutParams.strokeWidth * 100}vw;
              transition: ${getTransitions<ArticleItemType.Video>(['strokeWidth', 'radius', 'strokeColor'], hoverParams)};
            }
            .video-wrapper-${item.id}:hover .video {
              ${getHoverStyles<ArticleItemType.Video>(['strokeWidth', 'radius', 'strokeColor'], hoverParams)};
            }
          `);
        })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
