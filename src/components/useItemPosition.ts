import { AnchorSide, TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useCurrentLayout } from '../common/useCurrentLayout';

export const useItemPosition = (item: TArticleItemAny, sectionId: string) => {
  const layoutId = useCurrentLayout();
  const { top, left } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => item.area[layoutId],
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId,
    [layoutId]
  );
  return {
    top:  getItemTopStyle(top, item.area[layoutId].anchorSide),
    left: `${left * 100}vw`
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


