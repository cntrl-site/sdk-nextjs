import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { rangeMap } from '../utils/rangeMap';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { ScrollPlaybackVideoManager, ScrollPlaybackFrameData } from '@cntrl-site/sdk';

type PlaybackParams = { from: number, to: number };

interface Props {
  sectionId: string;
  src: string;
  playbackParams: PlaybackParams | null;
  style?: React.CSSProperties;
  className: string;
  scrollPlaybackFrameData?: ScrollPlaybackFrameData | null;
  frameBaseUrl?: string;
}

export const ScrollPlaybackVideo: FC<Props> = ({ sectionId, src, playbackParams, style, className, scrollPlaybackFrameData, frameBaseUrl }) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [time, setTime] = useState(0);
  const articleRectObserver = useContext(ArticleRectContext);
  const hasServerFrames = scrollPlaybackFrameData?.status === 'ready'
    && scrollPlaybackFrameData.batchId
    && scrollPlaybackFrameData.frameCount
    && scrollPlaybackFrameData.frameRate
    && scrollPlaybackFrameData.frameFormat
    && frameBaseUrl;

  useEffect(() => {
    if (!playbackParams || !articleRectObserver) return;
    return articleRectObserver.on('scroll', () => {
      const scrollPos = articleRectObserver.getSectionScroll(sectionId);
      const time = rangeMap(scrollPos, playbackParams.from, playbackParams.to, 0, 1, true);
      setTime(toFixed(time));
    });
  }, [playbackParams?.from, playbackParams?.to, time, articleRectObserver]);

  const scrollVideoManager = useMemo<ScrollPlaybackVideoManager | null>(() => {
    if (!containerElement) return null;
    const manager = new ScrollPlaybackVideoManager({
      src,
      videoContainer: containerElement,
      ...(hasServerFrames ? {
        frameData: {
          batchId: scrollPlaybackFrameData.batchId!,
          frameCount: scrollPlaybackFrameData.frameCount!,
          frameRate: scrollPlaybackFrameData.frameRate!,
          frameFormat: scrollPlaybackFrameData.frameFormat!
        },
        frameBaseUrl
      } : {})
    });
    return manager;
  }, [containerElement, src, hasServerFrames, frameBaseUrl]);

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
