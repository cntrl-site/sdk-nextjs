import { useContext, useEffect, useMemo, useState } from 'react';
import { ArticleRectContext } from '../../provider/ArticleRectContext';
import { ArticleRectObserver } from './ArticleRectObserver';

export const useArticleRectObserver = (el?: HTMLElement | null) => {
  const [articleRectObserver, setArticleRectObserver] = useState<ArticleRectObserver | null>(null);

  useEffect(() => {
    setArticleRectObserver(new ArticleRectObserver());
  }, []);

  useEffect(() => {
    if (!el || !articleRectObserver) return;
    return articleRectObserver.start(el);
  }, [el, articleRectObserver]);

  return articleRectObserver;
}
