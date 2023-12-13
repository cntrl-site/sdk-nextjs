import { FC, useId, useMemo, useState } from 'react';
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

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth, strokeColor, opacity, blur } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
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
