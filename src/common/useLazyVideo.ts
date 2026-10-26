import { useEffect } from 'react';

const NEAR_VIEWPORT_MARGIN = '100% 0px';

type IntersectionListener = (isIntersecting: boolean) => void;

type SharedObserver = {
  observer: IntersectionObserver;
  listeners: Map<Element, Set<IntersectionListener>>;
  states: Map<Element, boolean>;
};

const sharedObservers = new Map<string, SharedObserver>();

function getSharedObserver(rootMargin: string): SharedObserver {
  const existing = sharedObservers.get(rootMargin);
  if (existing) return existing;
  const listeners = new Map<Element, Set<IntersectionListener>>();
  const states = new Map<Element, boolean>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      states.set(entry.target, entry.isIntersecting);
      listeners.get(entry.target)?.forEach(listener => listener(entry.isIntersecting));
    }
  }, { rootMargin });
  const shared = { observer, listeners, states };
  sharedObservers.set(rootMargin, shared);
  return shared;
}

function observeIntersection(element: Element, rootMargin: string, listener: IntersectionListener): () => void {
  const { observer, listeners, states } = getSharedObserver(rootMargin);
  const elementListeners = listeners.get(element) ?? new Set<IntersectionListener>();
  if (elementListeners.size === 0) {
    listeners.set(element, elementListeners);
    observer.observe(element);
  }
  elementListeners.add(listener);
  const knownState = states.get(element);
  if (knownState !== undefined) listener(knownState);
  return () => {
    elementListeners.delete(listener);
    if (elementListeners.size > 0) return;
    listeners.delete(element);
    states.delete(element);
    observer.unobserve(element);
  };
}

function loadVideo(video: HTMLVideoElement) {
  if (video.preload !== 'auto') video.preload = 'auto';
}

function playVideo(video: HTMLVideoElement) {
  const playPromise = video.play();
  if (playPromise) playPromise.catch(() => {});
}

export function useLazyVideo(video: HTMLVideoElement | null, autoPlay: boolean) {
  useEffect(() => {
    if (!video) return;
    if (typeof IntersectionObserver === 'undefined') {
      loadVideo(video);
      video.autoplay = autoPlay;
      return;
    }
    const stopNear = observeIntersection(video, NEAR_VIEWPORT_MARGIN, (isNear) => {
      if (isNear) loadVideo(video);
    });
    if (!autoPlay) return stopNear;
    let isPausedByUser = false;
    let isPausingOffscreen = false;
    const handlePlay = () => {
      isPausedByUser = false;
    };
    const handlePause = () => {
      if (isPausingOffscreen) {
        isPausingOffscreen = false;
      } else if (!document.hidden) {
        isPausedByUser = true;
      }
    };
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    const stopVisible = observeIntersection(video, '0px', (isVisible) => {
      if (isVisible) {
        if (video.paused && !isPausedByUser) playVideo(video);
      } else if (!video.paused) {
        isPausingOffscreen = true;
        video.pause();
      }
    });
    return () => {
      stopNear();
      stopVisible();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [video, autoPlay]);
}
