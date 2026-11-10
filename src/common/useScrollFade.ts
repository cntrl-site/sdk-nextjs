import { useEffect } from 'react';

// the share of an element left on the screen as it leaves the top at which it starts to fade: all
// of it, so it fades from the first pixel scrolled, as the editor draws it
const FADE_START = 1;

/** The property `useScrollFade` writes the fade to, from 0 to 1, for the element's styles to draw it. */
export const SCROLL_FADE_PROPERTY = '--cntrl-scroll-fade';

/** How much larger a fading element is drawn once it has faded all the way. */
export const SCROLL_FADE_ZOOM = 0.15;

/**
 * How far an element leaving the screen's top has faded: nothing while all of it is on the screen,
 * as much as has left it as it scrolls off, all of it once it is gone. An element taller than the
 * screen counts the screen it fills instead, so it fades once its bottom is on the screen, over a
 * screen's height of scrolling. An element yet to reach the screen's top, or entering from below,
 * has not faded.
 */
export function scrollFadeProgress(top: number, bottom: number, screenHeight: number): number {
  const full = Math.min(bottom - top, screenHeight);
  if (full <= 0) return 0;
  const left = bottom / full;
  return Math.min(Math.max(1 - left / FADE_START, 0), 1);
}

/**
 * Writes to the element how far it has faded leaving the screen, as the page scrolls or the element
 * resizes, while enabled; nothing is drawn here, the element's styles draw the fade. Until it runs,
 * as the page is first drawn, the element is unfaded.
 */
export function useScrollFade(element: HTMLElement | null, isEnabled: boolean): void {
  useEffect(() => {
    if (!element || !isEnabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, bottom } = element.getBoundingClientRect();
      element.style.setProperty(SCROLL_FADE_PROPERTY, String(scrollFadeProgress(top, bottom, window.innerHeight)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      element.style.removeProperty(SCROLL_FADE_PROPERTY);
    };
  }, [element, isEnabled]);
}
