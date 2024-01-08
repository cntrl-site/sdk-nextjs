import { useEffect, useMemo, useRef } from 'react';
import { ImageEffect } from '@cntrl-site/effects';
import { rangeMap } from '../rangeMap';

export interface FXCursor {
  type: 'mouse' | 'manual';
  x: number;
  y: number;
}

interface FxParams {
  imageUrl?: string;
  fragmentShader?: string;
  cursor?: FXCursor;
}

const PATTERN_URL = 'https://cdn.cntrl.site/client-app-files/texture2.png';
const PATTERN_2_URL = 'https://cdn.cntrl.site/client-app-files/bayer16.png';

export function useImageFx(
  canvas: HTMLCanvasElement | null | undefined,
  enabled: boolean,
  {
    imageUrl,
    fragmentShader,
    cursor
  }: FxParams
): void {
  const mousePos = useRef<[number, number]>([0.0, 0.0]);
  const imageFx = useMemo<ImageEffect | undefined>(() => {
    if (!imageUrl || !cursor) return undefined;
    const { type, x, y } = cursor;
    return new ImageEffect(
      imageUrl,
      PATTERN_URL,
      PATTERN_2_URL,
      fragmentShader!,
      {
        time: 0,
        cursor: type === 'mouse' ? mousePos.current : [x, y]
      });
  }, [imageUrl, fragmentShader]);

  useEffect(() => {
    if (!cursor || cursor.type !== 'mouse' || !canvas || !imageFx) return;
    const handleMouseMove = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = rangeMap(evt.clientX, rect.left, rect.left + rect.width, 0, 1, true);
      const y = rangeMap(evt.clientY, rect.top, rect.top + rect.height, 0, 1, true);
      imageFx.setParam('cursor', [x, y]);
    };
    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvas, imageFx, cursor?.type]);

  useEffect(() => {
    const gl = canvas?.getContext('webgl2');
    if (!enabled || !canvas || !gl || !imageFx) return;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let running = false;
    let time = 0;
    let frame: number;

    const renderFrame = () => {
      time += 0.1;
      imageFx.setViewport(Math.floor(canvas.width), Math.floor(canvas.height));
      imageFx.setParam('time', time);
      imageFx.render(gl);
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
    imageFx.prepare(gl);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [canvas, imageFx, enabled]);
}
