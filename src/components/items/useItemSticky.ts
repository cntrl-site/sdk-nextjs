import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnchorSide, TArticleItemAny } from '@cntrl-site/sdk';
import { StickyManager } from '../../utils/StickyManager/StickyManager';
import { useCurrentLayout } from '../../common/useCurrentLayout';
import { ArticleRectContext } from '../../provider/ArticleRectContext';

export const useItemSticky = (top: number, parentOffsetTop: number, item: TArticleItemAny) => {
  const [isFixed, setIsFixed] = useState(false);
  const [adjustedTop, setAdjustedTop] = useState(top);
  const articleRectObserver = useContext(ArticleRectContext);
  const layoutId = useCurrentLayout();
  const sticky = useMemo(() => item.layoutParams[layoutId].sticky, [layoutId]);
  const stickyManager = useMemo(() => new StickyManager(sticky), []);

  const handleSticky = useCallback((scroll: number) => {
    setIsFixed(stickyManager.getIsSticky(scroll));
    setAdjustedTop(stickyManager.getPosition(
      scroll,
      top,
      parentOffsetTop
    ));
  }, [top, stickyManager, parentOffsetTop]);

  useEffect(() => {
    if (!articleRectObserver || !sticky) return;
    return articleRectObserver.on('scroll', () => {
      handleSticky(articleRectObserver.scroll);
    });
  }, [handleSticky, articleRectObserver, sticky]);
  return {
    isFixed,
    top: sticky ? `${adjustedTop * 100}vw` : getItemTopStyle(adjustedTop, layoutId ? item.area[layoutId].anchorSide : AnchorSide.Top)
  };
};

export function getItemTopStyle(top: number, anchorSide?: AnchorSide) {
  const defaultValue = `${top * 100}vw`;
  if (!anchorSide) return defaultValue;
  switch (anchorSide) {
    case AnchorSide.Top:
      return defaultValue;
    case AnchorSide.Center:
      return `calc(50% + ${top * 100}vw)`;
    case AnchorSide.Bottom:
      return `calc(100% + ${top * 100}vw)`;
  }
}
