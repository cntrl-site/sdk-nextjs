import { FC, useEffect, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';

export type TSectionVideo = {
  url: string;
  size: string;
  type: 'video';
  play: 'on-click' | 'auto';
  position: string;
  coverUrl: string | null;
  offsetX: number | null;
};

interface Props {
  container: HTMLDivElement;
  sectionId: string;
  media: TSectionVideo;
}

export const SectionVideo: FC<Props> = ({ container, sectionId, media }) => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const { url, size, position, offsetX, coverUrl, play } = media;
  const id = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isClickedOnCover, setIsClickedOnCover] = useState(false);

  const handleCoverClick = () => {
    if (!video || play !== 'on-click') return;
    setIsClickedOnCover(true);
    if (isPlaying) {
      video.pause();
      setUserPaused(true);
    } else {
      video.play();
      setUserPaused(false);
    }
  };

  useEffect(() => {
    if (!video || play !== 'on-click') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (userPaused || !isClickedOnCover) return;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, play, userPaused, isClickedOnCover]);

  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';

  return (
    <>
      <div className={`section-video-wrapper-${sectionId}`}>
        <video
          ref={setVideo}
          autoPlay={play === 'auto'}
          loop
          style={{ opacity: !isPlaying && play === 'on-click' && coverUrl ? 0 : 1 }}
          controls={false}
          muted={play === 'auto'}
          playsInline
          preload="auto"
          className={`video-background-${sectionId}`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={`${url}#t=0.001`} />
        </video>
        <div className={`video-background-${sectionId}-cover-container`} onClick={handleCoverClick}>
          {coverUrl && play === 'on-click' && (
            <img src={coverUrl} alt="Video cover" className={`video-background-${sectionId}-cover`} style={{ opacity: isPlaying ? 0 : 1 }} />
          )}
        </div>
      </div>
      <JSXStyle id={id}>{`
        .section-video-wrapper-${sectionId} {
          position: ${position === 'fixed' ? 'sticky' : 'relative'};
          height: ${position === 'fixed' ? '100vh' : '100%'};
          top: ${position === 'fixed' ? '100vh' : '0'};
          width: 100%;
          overflow: hidden;
        }
        .video-background-${sectionId}-cover-container {
          position: absolute;
          pointer-events: ${play === 'on-click' ? 'auto' : 'none'};
          left: 0;
          width: 100%;
          height: 100%;
          top: 0;
        }
        .video-background-${sectionId}-cover {
          position: relative;
          left: ${isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0')};
          width: ${isContainHeight ? 'auto' : '100%'};
          height: 100%;
          object-fit: ${isContainHeight ? 'unset' : size ?? 'cover'};
          transition: opacity 0.1s ease-in-out;
          transform: ${isContainHeight ? 'translateX(-50%)' : 'none'};
          ${hasOffsetX ? 'max-width: 100vw;' : ''}
        }
        .video-background-${sectionId} {
          object-fit: ${isContainHeight ? 'unset' : size ?? 'cover'};
          width: ${isContainHeight ? 'auto' : '100%'};
          height: 100%;
          position: relative;
          transform: ${isContainHeight ? 'translateX(-50%)' : 'none'};
          left: ${isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0')};
        }
      `}
      </JSXStyle>
    </>
  );
};
