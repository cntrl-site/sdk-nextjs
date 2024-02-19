import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { PlaybackVideoConverter } from '../utils/PlaybackVideoConverter/PlaybackVideoConverter';
import { rangeMap } from '../utils/rangeMap';
import { ArticleRectContext } from '../provider/ArticleRectContext';

interface Props {
  sectionId: string;
  src: string;
  playbackParams: { from: number, to: number } | null;
  style?: React.CSSProperties;
  className: string;
}

export const ScrollPlaybackVideo: FC<Props> = ({ sectionId, src, playbackParams, style, className}) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [time, setTime] = useState(0);
  const articleRectObserver = useContext(ArticleRectContext);

  useEffect(() => {
    if (!playbackParams || !articleRectObserver) return;
    const onScroll = () => {
      const scrollPos = articleRectObserver.getSectionScroll(sectionId);
      const time = rangeMap(scrollPos, playbackParams.from, playbackParams.to, 0, 1, true);
      setTime(toFixed(time));
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [playbackParams?.from, playbackParams?.to]);

  const scrollVideoManager = useMemo<PlaybackVideoConverter | null>(() => {
    if (!containerElement) return null;
    const manager = new PlaybackVideoConverter({
      src,
      videoContainer: containerElement
    });
    return manager;
  }, [containerElement, src]);

  useEffect(() => {
    return () => {
      scrollVideoManager?.destroy();
    };
  }, [scrollVideoManager]);

  useEffect(() => {
    const percentage = time;
    if (scrollVideoManager && percentage >= 0 && percentage <= 1) {
      scrollVideoManager.setTargetTimePercent(percentage);
    }
  }, [time, scrollVideoManager]);

  return <div className={className} style={style} ref={setContainerElement} />;
};

function toFixed(num: number) {
  return Number(num.toFixed(3));
}
