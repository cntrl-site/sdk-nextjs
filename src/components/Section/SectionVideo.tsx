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

  const handleCoverClick = () => {
    if (!video || play !== 'on-click') return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  useEffect(() => {
    if (!video || play !== 'auto') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.style.display = 'block';
          video.play().catch(() => {});
        } else {
          video.style.display = 'none';
          video.pause();
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0
      }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, play]);

  useEffect(() => {
    if (!video || play !== 'on-click') return;
    video.currentTime = 0.01;
    video.pause();
  }, [play]);

  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';

  return (
    <>
      <video
        ref={setVideo}
        autoPlay={play === 'auto'}
        loop
        style={{ opacity: !isPlaying && play === 'on-click' ? 0 : 1 }}
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
      <JSXStyle id={id}>{`
        .video-background-${sectionId}-cover-container {
          position: absolute;
          pointer-events: ${play === 'on-click' ? 'auto' : 'none'};
          left: 0;
          width: 100%;
          height: 100%;
          top: 0;
        }
        .video-background-${sectionId}-cover {
          position: ${position === 'fixed' ? 'sticky' : 'relative'};
          margin-left: ${isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0')};
          width: ${isContainHeight ? 'auto' : '100%'};
          height: ${position === 'fixed' ? '100vh' : '100%'};
          object-fit: ${isContainHeight ? 'unset' : size ?? 'cover'};
          transition: opacity 0.1s ease-in-out;
          top: ${position === 'fixed' ? '100vh' : '0'};
          transform: ${isContainHeight ? 'translateX(-50%)' : 'none'};
          ${hasOffsetX ? 'max-width: 100vw;' : ''}
        }
        .video-background-${sectionId} {
          object-fit: ${isContainHeight ? 'unset' : size ?? 'cover'};
          width: ${isContainHeight ? 'auto' : '100%'};
          height: ${position === 'fixed' ? '100vh' : '100%'};
          transform: ${isContainHeight ? 'translateX(-50%)' : 'none'};
          position: ${position === 'fixed' ? 'sticky' : 'relative'};
          top: ${position === 'fixed' ? '100vh' : 'unset'};
          margin-left: ${isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0')};
        }
      `}
      </JSXStyle>
    </>
  );
};
