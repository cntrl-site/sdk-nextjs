import { getLayoutStyles, YoutubeEmbedStructuredBlock } from '@cntrl-site/sdk';
import { FC, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { getYoutubeId } from '../../../utils/getValidYoutubeUrl';
import { useYouTubeIframeApi } from '../../../utils/Youtube/useYouTubeIframeApi';
import { YTPlayer, YTPlayerState } from '../../../utils/Youtube/YoutubeIframeApi';
import { useLayoutContext } from '../../useLayoutContext';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { embedFrameStyles } from './embedFrameStyles';

/** A YouTube video playing as the YouTube item does, its cover over it until it plays. */
export const StructuredYoutubeEmbed: FC<StructuredBlockItemProps<YoutubeEmbedStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const layoutId = useLayoutContext();
  const layoutParams = layoutId ? block.layoutParams[layoutId] : null;
  const { url, coverUrl } = block.commonParams;
  const YT = useYouTubeIframeApi();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [player, setPlayer] = useState<YTPlayer | undefined>(undefined);
  const [isCoverVisible, setIsCoverVisible] = useState(coverUrl !== null);
  useItemGeometry(block.id, ref);

  useEffect(() => {
    if (!YT || !frame || !layoutParams) return;
    const { play, controls } = layoutParams;
    setIsCoverVisible(play !== 'auto' && coverUrl !== null);
    const placeholder = document.createElement('div');
    frame.appendChild(placeholder);
    const created = new YT.Player(placeholder, {
      videoId: getYoutubeId(new URL(url)),
      playerVars: {
        autoplay: play === 'auto' ? '1' : '0',
        controls: controls ? '1' : '0'
      },
      events: {
        onStateChange: (event) => {
          if (play !== 'auto') return;
          if (event.data === YTPlayerState.Playing) setIsCoverVisible(false);
          if (event.data === YTPlayerState.Paused || event.data === YTPlayerState.Unstarted) setIsCoverVisible(coverUrl !== null);
        },
        onReady: (event) => {
          setPlayer(event.target);
          // only a video started by a click may play with sound
          if (play !== 'on-click') created.mute();
        }
      }
    });
    return () => {
      setPlayer(undefined);
      created.destroy();
      placeholder.parentElement?.removeChild(placeholder);
    };
  }, [YT, frame, layoutParams, url, coverUrl]);

  const play = () => {
    setIsCoverVisible(false);
    player?.playVideo();
  };

  const layoutValues: Record<string, any>[] = [block.area, block.layoutParams];
  return (
    <div
      ref={setRef}
      className={`structured-embed-${block.id}`}
      onMouseEnter={() => {
        if (layoutParams?.play === 'on-hover' && !isCoverVisible) player?.playVideo();
      }}
      onMouseLeave={() => {
        if (layoutParams?.play === 'on-hover') player?.pauseVideo();
      }}
    >
      {coverUrl && isCoverVisible && (
        <img
          className={`structured-embed-cover-${block.id}`}
          src={coverUrl}
          alt=""
          onClick={layoutParams?.play === 'on-click' ? play : undefined}
          onMouseEnter={layoutParams?.play === 'on-hover' ? play : undefined}
        />
      )}
      <div ref={setFrame} className={`structured-embed-frame-${block.id}`} />
      <JSXStyle id={`${reactId}-youtube-${block.id}`}>{`
        ${embedFrameStyles(block.id)}
        .structured-embed-frame-${block.id} iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => (`
          .structured-embed-${block.id} {
            ${area.height === undefined ? 'aspect-ratio: 16 / 9;' : 'height: 100%;'}
            opacity: ${layoutParams.opacity};
          }
          .structured-embed-frame-${block.id} {
            border-radius: ${layoutParams.radius * 100}vw;
          }
        `))}
      `}
      </JSXStyle>
    </div>
  );
};
