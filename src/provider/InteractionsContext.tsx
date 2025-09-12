import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';
import { InteractionsRegistry } from '../interactions/InteractionsRegistry';
import { Article } from '@cntrl-site/sdk';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { ArticleRectContext } from './ArticleRectContext';

export const InteractionsContext = createContext<InteractionsRegistry | undefined>(undefined);

interface Props {
  article: Article;
}

export const InteractionsProvider: FC<PropsWithChildren<Props>> = ({ article, children }) => {
  const { layoutId } = useCurrentLayout();
  const articleRectObserver = useContext(ArticleRectContext);
  const registry = useMemo(() => {
    if (!layoutId) return;
    return new InteractionsRegistry(article, layoutId);
  }, [layoutId]);

  useEffect(() => {
    if (!registry || !articleRectObserver) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      registry.notifyScroll(scrollY);
    };
    return articleRectObserver.on('scroll', handleScroll);
  }, [registry, articleRectObserver]);

  const notifyLoad = useCallback(() => {
    if (!registry) return;
    registry.notifyLoad();
  }, [registry]);

  useEffect(() => {
    notifyLoad();
  }, [notifyLoad]);

  useEffect(() => {
    const log = () => {
      console.log('load');
    };
    window.addEventListener('load', log);
    return () => window.removeEventListener('load', log);
  }, []);

  return (
    <InteractionsContext.Provider value={registry}>
      {children}
    </InteractionsContext.Provider>
  );
};

export function useInteractionsRegistry(): InteractionsRegistry | undefined {
  const registry = useContext(InteractionsContext);
  return registry;
}
