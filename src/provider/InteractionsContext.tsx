import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
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
      registry.notifyScrollTrigger(window.scrollY);
    };
    articleRectObserver.on('scroll', handleScroll);
    return () => articleRectObserver.off('scroll', handleScroll);
  }, [registry, articleRectObserver]);

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
