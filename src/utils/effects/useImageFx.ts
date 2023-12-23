import { useEffect, useMemo, useRef } from 'react';
import { ImageEffect } from '@cntrl-site/effects';
import { rangeMap } from '../rangeMap';

interface FxParams {
  imageUrl?: string;
  fragmentShader?: string;
}

export function useImageFx(
  canvas: HTMLCanvasElement | null | undefined,
  enabled: boolean,
  {
    imageUrl,
    fragmentShader
  }: FxParams
): void {
  const cursor = useRef<[number, number]>([0, 0]);
  const imageFx = useMemo<ImageEffect | undefined>(() => {
    if (!imageUrl) return undefined;
    return new ImageEffect(imageUrl, fragmentShader!, { time: 0, cursor: cursor.current });
  }, [imageUrl, fragmentShader]);

  useEffect(() => {
    if (!canvas || !imageFx) return;
    const handleMouseMove = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = rangeMap(evt.clientX, rect.left, rect.left + rect.width, 0, 1);
      const y = rangeMap(evt.clientY, rect.top, rect.top + rect.height, 0, 1);
      imageFx.setParam('cursor', [x, y]);
    };
    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvas, imageFx]);

  useEffect(() => {
    const gl = canvas?.getContext('webgl2');
    if (!enabled || !canvas || !gl || !imageFx) return;
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
