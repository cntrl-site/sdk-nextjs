import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import Player from '@vimeo/player';
import JSXStyle from 'styled-jsx/style';
import { TVimeoEmbedItem } from '@cntrl-site/core';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';
import { ArticleItemType, getLayoutStyles } from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useCurrentLayout } from '../../common/useCurrentLayout';

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, sectionId }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const layout = useCurrentLayout()
  const { radius } = useEmbedVideoItem(item, sectionId);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const vimeoPlayer = useMemo(() => iframeRef ? new Player(iframeRef) : undefined, [iframeRef]);
  const isAutoPlayOnHover = useMemo(() => {
    const layoutHoverStates = item.state.hover[layout];
    if (!layoutHoverStates) return false;
    return layoutHoverStates.autoplay === true;
  }, [layout, item]);
  const angle = useItemAngle(item, sectionId);
  const { autoplay, controls, loop, muted, pictureInPicture, url } = item.commonParams;
  const getValidVimeoUrl = (url: string): string => {
    const validURL = new URL(url);
    validURL.searchParams.append('controls', String(controls));
    validURL.searchParams.append('autoplay', String(autoplay));
    validURL.searchParams.append('muted', String(muted));
    validURL.searchParams.append('loop', String(loop));
    validURL.searchParams.append('pip', String(pictureInPicture));
    validURL.searchParams.append('title', '0');
    validURL.searchParams.append('byline', '0');
    validURL.searchParams.append('portrait', '0');
    validURL.searchParams.append('autopause', 'false');

    return validURL.href;
  }
  const validUrl = getValidVimeoUrl(url);

  return (
    <LinkWrapper url={item.link?.url}>
      <div className={`embed-video-wrapper-${item.id}`}
        style={{
          borderRadius: `${radius * 100}vw`,
          transform: `rotate(${angle}deg)`
        }}
        onMouseEnter={() => {
          if (!vimeoPlayer || !isAutoPlayOnHover) return;
          vimeoPlayer.play();
        }}
        onMouseLeave={() =>{
          if (!vimeoPlayer || !isAutoPlayOnHover) return;
          vimeoPlayer.pause();
        }}
      >
        <iframe
          ref={setIframeRef}
          className="embedVideo"
          src={validUrl || ''}
          allow="autoplay; fullscreen; picture-in-picture;"
          allowFullScreen
        />
      </div>
      <JSXStyle id={id}>{`
      .embed-video-wrapper-${item.id} {
        position: absolute;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      .embedVideo {
        width: 100%;
        height: 100%;
        z-index: 1;
        border: none;
      }
      ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
        return (`
          .embed-video-wrapper-${item.id} {
            transition: ${getTransitions<ArticleItemType.VimeoEmbed>(['angle', 'radius'], hoverParams)};
          }
          .embed-video-wrapper-${item.id}:hover {
            ${getHoverStyles<ArticleItemType.VimeoEmbed>(['angle', 'radius'], hoverParams)}
          }
        `);
      })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
