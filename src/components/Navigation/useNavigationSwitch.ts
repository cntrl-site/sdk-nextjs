import { useEffect, useState } from 'react';

function getArticleTop(element: HTMLElement): number {
  const raw = getComputedStyle(element).getPropertyValue('--cntrl-article-top');
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useNavigationSwitch(isEnabled: boolean, element: HTMLElement | null): boolean {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (!isEnabled || !element) {
      setIsPinned(false);
      return;
    }

    const sync = () => {
      const next = element.getBoundingClientRect().bottom <= getArticleTop(element) + 0.5;
      setIsPinned(prev => (prev === next ? prev : next));
    };

    const observer = new ResizeObserver(sync);
    observer.observe(element);
    sync();
    window.addEventListener('scroll', sync, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', sync);
    };
  }, [isEnabled, element]);

  return isPinned;
}
