import { FC, useId, useMemo, useState } from 'react';
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
import { useRegisterResize } from "../../common/useRegisterResize";

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { radius, blur } = useEmbedVideoItem(item, sectionId);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const vimeoPlayer = useMemo(() => iframeRef ? new Player(iframeRef) : undefined, [iframeRef]);
  const angle = useItemAngle(item, sectionId);
  const { play, controls, loop, muted, pictureInPicture, url } = item.commonParams;
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const getValidVimeoUrl = (url: string): string => {
    const validURL = new URL(url);
    validURL.searchParams.append('controls', String(controls));
    validURL.searchParams.append('autoplay', String(play === 'auto'));
    validURL.searchParams.append('muted', String(play !== 'on-click' ? true : muted));
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
      <div
        className={`embed-video-wrapper-${item.id}`}
        ref={setRef}
        style={{
          borderRadius: `${radius * 100}vw`,
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * 100}vw)`
        }}
        onMouseEnter={() => {
          if (!vimeoPlayer || play !== 'on-hover') return;
          vimeoPlayer.play();
        }}
        onMouseLeave={() =>{
          if (!vimeoPlayer || play !== 'on-hover') return;
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
            transition: ${getTransitions<ArticleItemType.VimeoEmbed>(['angle', 'radius', 'blur'], hoverParams)};
          }
          .embed-video-wrapper-${item.id}:hover {
            ${getHoverStyles<ArticleItemType.VimeoEmbed>(['angle', 'radius', 'blur'], hoverParams)}
          }
        `);
      })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
