import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { rangeMap } from '../utils/rangeMap';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { ScrollPlaybackVideoManager } from '@cntrl-site/sdk';

type PlaybackParams = { from: number, to: number };

interface Props {
  sectionId: string;
  src: string;
  playbackParams: PlaybackParams | null;
  style?: React.CSSProperties;
  className: string;
}

export const ScrollPlaybackVideo: FC<Props> = ({ sectionId, src, playbackParams, style, className }) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [time, setTime] = useState(0);
  const articleRectObserver = useContext(ArticleRectContext);

  useEffect(() => {
    if (!playbackParams || !articleRectObserver) return;
    const from = playbackParams.from;
    const to = playbackParams.to;
    return articleRectObserver.on('scroll', () => {
      const scrollPos = articleRectObserver.getSectionScroll(sectionId);
      const nextTime = rangeMap(scrollPos, from, to, 0, 1, true);
      setTime(toFixed(nextTime));
    });
  }, [sectionId, playbackParams?.from, playbackParams?.to, articleRectObserver]);

  const scrollVideoManager = useMemo<ScrollPlaybackVideoManager | null>(() => {
    if (!containerElement) return null;
    const manager = new ScrollPlaybackVideoManager({
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
    if (scrollVideoManager && time >= 0 && time <= 1) {
      scrollVideoManager.setTargetTimePercent(time);
    }
  }, [time, scrollVideoManager]);

  return <div className={className} style={style} ref={setContainerElement} />;
};

function toFixed(num: number) {
  return Number(num.toFixed(3));
}
