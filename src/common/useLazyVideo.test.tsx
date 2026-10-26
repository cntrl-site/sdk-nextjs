import { act, render } from '@testing-library/react';
import { useState } from 'react';
import { SectionVideo } from '../components/Section/SectionVideo';
import { useLazyVideo } from './useLazyVideo';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly targets = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback, readonly options: IntersectionObserverInit = {}) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  takeRecords() {
    return [];
  }

  emit(target: Element, isIntersecting: boolean) {
    this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

const NEAR = '100% 0px';
const VISIBLE = '0px';

function emit(rootMargin: string, target: Element, isIntersecting: boolean) {
  const observer = FakeIntersectionObserver.instances.find(instance => instance.options.rootMargin === rootMargin);
  if (!observer) throw new Error(`no observer for ${rootMargin}`);
  act(() => observer.emit(target, isIntersecting));
}

function isObserved(rootMargin: string, target: Element) {
  return FakeIntersectionObserver.instances.some(instance => instance.options.rootMargin === rootMargin && instance.targets.has(target));
}

const paused = new WeakMap<HTMLMediaElement, boolean>();
const play = jest.fn();
const pause = jest.fn();

function TestVideo({ autoPlay }: { autoPlay: boolean }) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  useLazyVideo(video, autoPlay);
  return <video ref={setVideo} preload="none" muted loop playsInline />;
}

describe('useLazyVideo', () => {
  const originalIntersectionObserver = window.IntersectionObserver;

  beforeEach(() => {
    window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
    play.mockReset();
    pause.mockReset();
    jest.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function (this: HTMLMediaElement) {
      return paused.get(this) ?? true;
    });
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      play(this);
      paused.set(this, false);
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    });
    jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
      pause(this);
      paused.set(this, true);
      this.dispatchEvent(new Event('pause'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it('loads nothing while the video is far from the viewport', () => {
    const { container } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, false);
    emit(VISIBLE, video, false);
    expect(video.preload).toBe('none');
    expect(play).not.toHaveBeenCalled();
  });

  it('starts loading once the video is within a viewport of the screen', () => {
    const { container } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    expect(video.preload).toBe('auto');
    expect(play).not.toHaveBeenCalled();
  });

  it('plays an autoplay video while it is visible and pauses it when it leaves', () => {
    const { container } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    emit(VISIBLE, video, true);
    expect(play).toHaveBeenCalledTimes(1);
    emit(VISIBLE, video, false);
    expect(pause).toHaveBeenCalledTimes(1);
    emit(VISIBLE, video, true);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('keeps a video the viewer paused paused until they play it again', () => {
    const { container } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    emit(VISIBLE, video, true);
    act(() => video.pause());
    emit(VISIBLE, video, false);
    emit(VISIBLE, video, true);
    expect(play).toHaveBeenCalledTimes(1);

    act(() => {
      void video.play();
    });
    emit(VISIBLE, video, false);
    emit(VISIBLE, video, true);
    expect(play).toHaveBeenCalledTimes(3);
  });

  it('resumes a video the browser paused while the page was hidden', () => {
    const { container } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    emit(VISIBLE, video, true);
    const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => video.pause());
    hidden.mockRestore();
    emit(VISIBLE, video, false);
    emit(VISIBLE, video, true);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('only preloads a video that does not autoplay', () => {
    const { container } = render(<TestVideo autoPlay={false} />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    expect(video.preload).toBe('auto');
    expect(isObserved(VISIBLE, video)).toBe(false);
    expect(play).not.toHaveBeenCalled();
  });

  it('stops observing on unmount', () => {
    const { container, unmount } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    unmount();
    expect(isObserved(NEAR, video)).toBe(false);
    expect(isObserved(VISIBLE, video)).toBe(false);
  });

  it('shares one observer per margin across videos', () => {
    const { container } = render(
      <>
        <TestVideo autoPlay />
        <TestVideo autoPlay />
      </>
    );
    const videos = Array.from(container.querySelectorAll('video'));
    const nearObservers = FakeIntersectionObserver.instances.filter(instance => instance.options.rootMargin === NEAR);
    expect(nearObservers).toHaveLength(1);
    expect(nearObservers[0].targets).toEqual(new Set(videos));
    emit(NEAR, videos[0], true);
    expect(videos.map(video => video.preload)).toEqual(['auto', 'none']);
  });

  it('falls back to preload and autoplay without IntersectionObserver', () => {
    window.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
    const { container } = render(<TestVideo autoPlay />);
    const video = container.querySelector('video')!;
    expect(video.preload).toBe('auto');
    expect(video.autoplay).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });
});

describe('SectionVideo', () => {
  const media = {
    url: 'https://cdn.cntrl.site/video.mp4',
    size: 'cover',
    type: 'video' as const,
    play: 'auto' as const,
    position: 'local',
    coverUrl: null,
    offsetX: null
  };

  it('renders the background video idle and plays it once it is on screen', () => {
    const originalIntersectionObserver = window.IntersectionObserver;
    window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
    const playSpy = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const { container } = render(<SectionVideo container={document.createElement('div')} sectionId="s" media={media} />);
    const video = container.querySelector('video')!;
    expect(video.hasAttribute('autoplay')).toBe(false);
    expect(video.getAttribute('preload')).toBe('none');
    expect(playSpy).not.toHaveBeenCalled();
    emit(NEAR, video, true);
    emit(VISIBLE, video, true);
    expect(video.preload).toBe('auto');
    expect(playSpy).toHaveBeenCalled();
    playSpy.mockRestore();
    window.IntersectionObserver = originalIntersectionObserver;
  });
});
