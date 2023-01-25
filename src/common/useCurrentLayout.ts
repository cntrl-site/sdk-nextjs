import { useCntrlContext } from '../provider/useCntrlContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';

interface LayoutData {
  layoutId: string;
  start: number;
  end: number;
}

export const useCurrentLayout = () => {
  const { layouts } = useCntrlContext();
  const articleRectObserver = useContext(ArticleRectContext);
  const [layoutId, setLayoutId] = useState<string | undefined>(undefined);
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
  const getCurrentLayout = (articleWidth: number) => {
    return layoutRanges.find(l => articleWidth >= l.start && articleWidth < l.end)!.layoutId
  };

  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', () => {
      const articleWidth = articleRectObserver.width;
      setLayoutId(getCurrentLayout(articleWidth));
    })
  }, [articleRectObserver]);

  return layoutId;
};
