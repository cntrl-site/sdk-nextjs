import { FC, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getYoutubeId } from '../../utils/getValidYoutubeUrl';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';
import { ArticleItemType, getLayoutStyles, YoutubeEmbedItem as TYoutubeEmbedItem } from '@cntrl-site/sdk';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useYouTubeIframeApi } from '../../utils/Youtube/useYouTubeIframeApi';
import { YTPlayer } from '../../utils/Youtube/YoutubeIframeApi';
import { useRegisterResize } from "../../common/useRegisterResize";

export const YoutubeEmbedItem: FC<ItemProps<TYoutubeEmbedItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { play, controls, url } = item.commonParams;
  const { radius, blur } = useEmbedVideoItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const YT = useYouTubeIframeApi();
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [player, setPlayer] = useState<YTPlayer | undefined>(undefined);
  useRegisterResize(div, onResize);

  useEffect(() => {
    const newUrl = new URL(url);
    const videoId = getYoutubeId(newUrl);
    if (!YT || !videoId || !div) return;
    const placeholder = document.createElement('div');
    div.appendChild(placeholder);
    const player = new YT.Player(placeholder, {
      videoId,
      playerVars: {
        autoplay: play === 'auto' ? '1' : '0',
        controls: controls ? '1' : '0'
      },
      events: {
        onReady: (event) => {
          setPlayer(event.target);
          if (play !== 'on-click') {
            player.mute();
          }
        }
      }
    });
    return () => {
      setPlayer(undefined);
      player.destroy();
      placeholder.parentElement?.removeChild(placeholder);
    };
  }, [YT, div]);

  return (
    <LinkWrapper url={item.link?.url}>
      <div
        className={`embed-youtube-video-wrapper-${item.id}`}
        onMouseEnter={() => {
          if (!player || play !== 'on-hover') return;
          player.playVideo();
        }}
        onMouseLeave={() => {
          if (!player || play !== 'on-hover') return;
          player.pauseVideo();
        }}
        style={{
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * 100}vw)`
        }}
      >
        <div
          className={`embed-${item.id}`}
          ref={setDiv}
          style={{ borderRadius: `${radius * 100}vw` }}
        />
      </div>
      <JSXStyle id={id}>{`
        .embed-youtube-video-wrapper-${item.id},
        .embed-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .embed-${item.id} {
          overflow: hidden;
        }
        .embed-youtube-video-wrapper-${item.id} iframe {
          width: 100%;
          height: 100%;
          z-index: 1;
          border: none;
        }
        ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .embed-youtube-video-wrapper-${item.id} {
              transition: ${getTransitions<ArticleItemType.YoutubeEmbed>(['angle', 'blur'], hoverParams)};
            }
            .embed-youtube-video-wrapper-${item.id} .embed-${item.id} {
              transition: ${getTransitions<ArticleItemType.YoutubeEmbed>(['radius'], hoverParams)};
            }
            .embed-youtube-video-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.YoutubeEmbed>(['angle', 'blur'], hoverParams)}
            }
            .embed-youtube-video-wrapper-${item.id}:hover .embed-${item.id} {
              ${getHoverStyles<ArticleItemType.YoutubeEmbed>(['radius'], hoverParams)}
            }
          `);
      })}
      `}</JSXStyle>
    </LinkWrapper>
  )
};

