'use client';

import { FC, useEffect } from 'react';
import { AnimationLayout } from './SectionAnimations';

interface ScrollTrackerProps {
  selector: string;
  cssVarName: string;
  layouts?: AnimationLayout[];
}

export const ScrollTracker: FC<ScrollTrackerProps> = ({
  selector,
  cssVarName,
  layouts
}) => {
  const element = typeof document !== 'undefined' ? document.querySelector(selector) : undefined;

  useEffect(() => {
    if (!(element instanceof HTMLElement) || !layouts) return;
    const updateScrollPosition = () => {
      const rect = element.getBoundingClientRect();
      const layout = layouts.find(l => l.minWidth <= rect.width && rect.width <= l.maxWidth);
      if (!layout) return;
      const s = layout.startPosition * 1000;
      const e = layout.endPosition * 1000;
      const top = -(rect.top * 1000) / rect.width;
      const animTop = Math.max(0, Math.min(((top - s) / (e - s)) * 1000, 1000));
      element.style.setProperty(`--${cssVarName}`, `-${animTop}`);
    };
    const observer = new ResizeObserver(updateScrollPosition);
    observer.observe(element);
    window.addEventListener('scroll', updateScrollPosition, { passive: true });
    return () => {
      observer.unobserve(element);
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, [element, cssVarName, layouts]);

  return null;
};
