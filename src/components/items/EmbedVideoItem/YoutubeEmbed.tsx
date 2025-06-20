import { FC, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getYoutubeId } from '../../../utils/getValidYoutubeUrl';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';
import { getLayoutStyles, YoutubeEmbedItem as TYoutubeEmbedItem } from '@cntrl-site/sdk';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useYouTubeIframeApi } from '../../../utils/Youtube/useYouTubeIframeApi';
import { YTPlayer } from '../../../utils/Youtube/YoutubeIframeApi';
import { useRegisterResize } from "../../../common/useRegisterResize";
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';

export const YoutubeEmbedItem: FC<ItemProps<TYoutubeEmbedItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { play, controls, url } = item.commonParams;
  const { radius: itemRadius, blur: itemBlur, opacity: itemOpacity } = useEmbedVideoItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const YT = useYouTubeIframeApi();
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [player, setPlayer] = useState<YTPlayer | undefined>(undefined);
  const [isCoverVisible, setIsCoverVisible] = useState(false);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const wrapperStateParams = interactionCtrl?.getState(['angle', 'blur', 'opacity']);
  const frameStateParams = interactionCtrl?.getState(['radius']);
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const radius = getStyleFromItemStateAndParams(frameStateParams?.styles?.radius, itemRadius);
  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
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
        onStateChange: (event) => {
          if (play !== 'auto') return;
          if (event.data === 1) {
            setIsCoverVisible(false);
          }
          if (event.data === 2 || event.data === -1 ) {
            setIsCoverVisible(true);
          }
        },
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

  const onCoverClick = () => {
    if (!player || !imgRef) return;
    player.playVideo();
    setIsCoverVisible(false);
  };

  useEffect(() => {
    if (play === 'on-click' && !controls) {
      setIsCoverVisible(true);
    }
  }, []);

  useEffect(() => {
    onVisibilityChange?.(isInteractive);
    if (!isInteractive && player) {
      player.pauseVideo();
    }
  }, [isInteractive, onVisibilityChange, player]);

  useEffect(() => {
    if (!player || !interactionCtrl) return;
    interactionCtrl.setActionReceiver((type) => {
      switch(type) {
        case 'play':
          player.playVideo();
          break;
        case 'pause':
          player.pauseVideo();
          break;
      }
    });
  }, [interactionCtrl, player]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
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
          ...(opacity !== undefined ? { opacity } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg) translateZ(0)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          transition: wrapperStateParams?.transition ?? 'none'
        }}
      >
        {item.commonParams.coverUrl && (
          <img
            ref={setImgRef}
            onClick={() => onCoverClick()}
            src={item.commonParams.coverUrl ?? ''}
            style={{
              display: isCoverVisible ? 'block' : 'none',
              cursor: 'pointer',
              position: 'absolute',
              objectFit: 'cover',
              height: '100%',
              width: '100%',
              top: '0',
              left: '0',
              zIndex: 1
            }}
            alt="Cover img"
          />
        )}
        <div
          className={`embed-${item.id}`}
          ref={setDiv}
          style={{
            ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
            transition: frameStateParams?.transition ?? 'none'
          }}
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
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          return (`
            .embed-youtube-video-wrapper-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg) translateZ(0);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
            }
            .embed-youtube-video-wrapper-${item.id} .embed-${item.id} {
              border-radius: ${layoutParams.radius * 100}vw;
            }
          `);
      })}
      `}</JSXStyle>
    </LinkWrapper>
  )
};

