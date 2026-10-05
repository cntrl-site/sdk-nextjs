import { VideoStructuredBlock } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { useLayoutContext } from '../../useLayoutContext';
import { StructuredBlockItemProps } from '../StructuredBlockItem';

/**
 * A video at its own proportions, playing on its own, once pointed at, or once clicked, as the
 * layout says; its cover shows until it first plays. It takes the 16:9 of a video until its own
 * proportions are known.
 */
export const StructuredVideo: FC<StructuredBlockItemProps<VideoStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const layoutId = useLayoutContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  useItemGeometry(block.id, ref);
  const { url, coverUrl } = block.commonParams;
  const layoutParams = layoutId ? block.layoutParams[layoutId] : undefined;
  const play = layoutParams?.play;
  const start = () => {
    if (!video) return;
    setHasPlayed(true);
    video.play();
  };
  return (
    <div ref={setRef} className={`structured-video-${block.id}${isLoaded ? '' : ` structured-video-loading-${block.id}`}`}>
      {layoutParams && (
        <>
          <video
            key={layoutId}
            ref={setVideo}
            className={`structured-video-el-${block.id}`}
            src={url}
            autoPlay={play === 'auto'}
            muted={layoutParams.muted}
            controls={layoutParams.controls}
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={() => setIsLoaded(true)}
            onPlay={() => {
              setIsPlaying(true);
              setHasPlayed(true);
            }}
            onPause={() => setIsPlaying(false)}
            onMouseEnter={() => {
              if (play === 'on-hover') start();
            }}
            onMouseLeave={() => {
              if (play === 'on-hover') video?.pause();
            }}
          />
          {coverUrl && play !== 'auto' && !hasPlayed && (
            <img
              className={`structured-video-cover-${block.id}`}
              src={coverUrl}
              alt=""
              onMouseEnter={() => {
                if (play === 'on-hover') start();
              }}
              onClick={start}
            />
          )}
          {play === 'on-click' && !layoutParams.controls && (
            <div
              className={`structured-video-overlay-${block.id}`}
              onClick={() => (isPlaying ? video?.pause() : start())}
            />
          )}
        </>
      )}
      <JSXStyle id={`${reactId}-video-${block.id}`}>{`
        .structured-video-${block.id} {
          position: relative;
          width: 100%;
        }
        .structured-video-loading-${block.id} {
          aspect-ratio: 16 / 9;
        }
        .structured-video-el-${block.id} {
          display: block;
          width: 100%;
          height: auto;
        }
        .structured-video-cover-${block.id},
        .structured-video-overlay-${block.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .structured-video-cover-${block.id} {
          object-fit: cover;
        }
      `}
      </JSXStyle>
    </div>
  );
};
