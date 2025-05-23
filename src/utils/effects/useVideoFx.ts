import { useEffect, useMemo, useState } from 'react';
import { MediaEffect, VideoTextureManager } from '@cntrl-site/effects';
import { rangeMap } from '../rangeMap';

interface FxParams {
  videoUrl?: string;
  fragmentShader: string | null;
  controls?: Record<string, number | [number, number]>;
}

const PATTERN_URL = 'https://cdn.cntrl.site/client-app-files/texture2.png';
const PATTERN_2_URL = 'https://cdn.cntrl.site/client-app-files/bayer16.png';

export function useVideoFx(
  canvas: HTMLCanvasElement | null | undefined,
  enabled: boolean,
  {
    videoUrl,
    fragmentShader,
    controls
  }: FxParams,
  width: number,
  height: number
): boolean {
  const [isFXAllowed, setIsFXAllowed] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const active = enabled && isReady;
  const videoTextureManager = useMemo(() => {
    if (!videoUrl || !enabled) return;
    const handlePlayError = () => {
      setIsFXAllowed(false);
    };
    return new VideoTextureManager(videoUrl, handlePlayError);
  }, [videoUrl, enabled]);
  const videoFx = useMemo<MediaEffect | undefined>(() => {
    if (!videoTextureManager) return;
    return new MediaEffect(
      videoTextureManager,
      PATTERN_URL,
      PATTERN_2_URL,
      fragmentShader!,
      {
        time: 0,
        cursor: [0, 0],
        ...controls
      },
      width,
      height
    );
  }, [videoTextureManager, fragmentShader, width, height]);

  useEffect(() => {
    if (!videoTextureManager) return;
    videoTextureManager.onReadyStatusChange(setIsReady);
  }, [videoTextureManager]);

  useEffect(() => {
    if (!canvas || !videoFx) return;
    const handleMouseMove = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = rangeMap(evt.clientX, rect.left, rect.left + rect.width, 0, 1, true);
      const y = rangeMap(evt.clientY, rect.top, rect.top + rect.height, 0, 1, true);
      videoFx.setParam('cursor', [x, y]);
    };
    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvas, videoFx]);

  useEffect(() => {
    const gl = canvas?.getContext('webgl2');
    if (!active || !canvas || !gl || !videoFx) return;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let running = false;
    let time = 0;
    let frame: number;

    const renderFrame = () => {
      time += 0.1;
      videoFx.setViewport(Math.floor(canvas.width), Math.floor(canvas.height));
      videoFx.setParam('time', time);
      try {
        videoFx.render(gl);
      } catch {
        setIsFXAllowed(false);
      }
      frame = requestAnimationFrame(renderFrame);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        frame = requestAnimationFrame(renderFrame);
        running = true;
        return;
      }
      if (!entry.isIntersecting && running) {
        window.cancelAnimationFrame(frame);
        running = false;
      }
    });
    observer.observe(canvas);
    try {
      videoFx.prepare(gl);
    } catch {
      setIsFXAllowed(false);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [canvas, videoFx, active]);
  return isFXAllowed;
}
