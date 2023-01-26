import { useCntrlContext } from '../provider/useCntrlContext';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';

interface LayoutData {
  layoutId: string;
  start: number;
  end: number;
}

export const useCurrentLayout = () => {
  const { layouts } = useCntrlContext();
  const [initialLayout] = layouts;
  const articleRectObserver = useContext(ArticleRectContext);
  const layoutRanges = useMemo(() => {
    const sorted = layouts.slice().sort((la, lb) => la.startsWith - lb.startsWith);
    return sorted.reduce<LayoutData[]>((acc, layout, i, layouts) => {
      const next = layouts[i + 1];
      return [
        ...acc,
        {
          layoutId: layout.id,
          start: layout.startsWith,
          end: next ? next.startsWith : Number.MAX_SAFE_INTEGER
        }
      ];
    }, []);
  }, [layouts]);
  const getCurrentLayout = useCallback((articleWidth: number) => {
    return layoutRanges.find(l => articleWidth >= l.start && articleWidth < l.end)!.layoutId;
  }, [layoutRanges]);
  const [layoutId, setLayoutId] = useState<string>(getCurrentLayout(isServer() ? 0 : window.innerWidth));

  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', () => {
      const articleWidth = articleRectObserver.width;
      setLayoutId(getCurrentLayout(articleWidth));
    });
  }, [articleRectObserver, getCurrentLayout]);

  return layoutId;
};

function isServer(): boolean {
  return typeof window === 'undefined';
}