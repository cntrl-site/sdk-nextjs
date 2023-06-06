import { useEffect } from 'react';
import { ArticleRectObserver } from './ArticleRectObserver';

export const useSectionRegistry = ( sectionId: string, el?: HTMLElement | null) => {
  const articleRectObserver = new ArticleRectObserver();

  useEffect(() => {
    if (!el || !articleRectObserver) return;
    return articleRectObserver.register(el, sectionId);
  }, [el, articleRectObserver])
};
