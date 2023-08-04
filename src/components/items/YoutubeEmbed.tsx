import { FC, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { TYoutubeEmbedItem } from '@cntrl-site/core';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getYoutubeId } from '../../utils/getValidYoutubeUrl';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';
import { ArticleItemType, getLayoutStyles } from '@cntrl-site/sdk';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useYouTubeIframeApi } from '../../utils/Youtube/useYouTubeIframeApi';
import { YTPlayer } from '../../utils/Youtube/YoutubeIframeApi';

export const YoutubeEmbedItem: FC<ItemProps<TYoutubeEmbedItem>> = ({ item, sectionId }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { play, controls, url } = item.commonParams;
  const { radius } = useEmbedVideoItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const YT = useYouTubeIframeApi();
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [player, setPlayer] = useState<YTPlayer | undefined>(undefined);

  // const getValidYoutubeUrl = (url: string): string => {
  //   const newUrl = new URL(url);
  //   const id = getYoutubeId(newUrl);
  //   const validUrl = new URL(`https://www.youtube.com/embed/${id}`);
  //   validUrl.searchParams.append('controls', `${ Number(controls) }`);
  //   validUrl.searchParams.append('autoplay', `${ Number(play === 'auto') }`);
  //   validUrl.searchParams.append('mute', `${ Number(play === 'auto') }`);
  //   return validUrl.href;
  // }
  // const validUrl = getValidYoutubeUrl(url);

  useEffect(() => {
    const newUrl = new URL(url);
    const videoId = getYoutubeId(newUrl);
    if (!YT || !videoId || !div) return;
    const divRect = div.getBoundingClientRect();
    const placeholder = document.createElement('div');
    const player = new YT.Player(placeholder, {
      width: divRect.width,
      height: divRect.height,
      videoId,
      playerVars: {
        autoplay: play === 'auto' ? '1' : '0',
        controls: controls ? '1' : '0'
      },
      events: {
        onReady: (event) => {
          setPlayer(event.target);
        }
      }
    });
    return () => {
      setPlayer(undefined);
      player.destroy();
      placeholder.parentElement?.removeChild(placeholder);
    };
  }, []);

  useEffect(() => {
    if (!player) return;
    if (play === 'auto') {
      player.mute();
    }
  }, [player, play]);

  return (
    <LinkWrapper url={item.link?.url}>
      <div className={`embed-youtube-video-wrapper-${item.id}`}
         onMouseEnter={() => {
           player?.playVideo();
         }}
         onMouseLeave={() => {
           player?.pauseVideo();
         }}
         ref={setDiv}
         style={{
           borderRadius: `${radius * 100}vw`,
           transform: `rotate(${angle}deg)`
         }}
      >
      </div>
      <JSXStyle id={id}>{`
        .embed-youtube-video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        .embedYoutubeVideo {
          width: 100%;
          height: 100%;
          z-index: 1;
          border: none;
        }
        ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .embed-youtube-video-wrapper-${item.id} {
              transition: ${getTransitions<ArticleItemType.YoutubeEmbed>(['angle', 'radius'], hoverParams)};
            }
            .embed-youtube-video-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.YoutubeEmbed>(['angle', 'radius'], hoverParams)}
            }
          `);
      })}
      `}</JSXStyle>
    </LinkWrapper>
  )
};

