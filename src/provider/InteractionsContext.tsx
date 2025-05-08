import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { InteractionsRegistry } from '../interactions/InteractionsRegistry';
import { Article } from '@cntrl-site/sdk';
import { useCurrentLayout } from '../common/useCurrentLayout';

export const InteractionsContext = createContext<InteractionsRegistry | undefined>(undefined);

interface Props {
  article: Article;
}

export const InteractionsProvider: FC<PropsWithChildren<Props>> = ({ article, children }) => {
  const { layoutId } = useCurrentLayout();
  const registry = useMemo(() => {
    if (!layoutId) return;
    return new InteractionsRegistry(article, layoutId);
  }, [layoutId]);

  useEffect(() => {
    if (!registry) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      registry.notifyScrollTrigger(scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [registry]);

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
