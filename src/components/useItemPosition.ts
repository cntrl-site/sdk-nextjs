import { AnchorSide, TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useCurrentLayout } from '../common/useCurrentLayout';

const defaultArea = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  angle: 0,
  zIndex: 0
};

export const useItemPosition = (item: TArticleItemAny) => {
  const layoutId = useCurrentLayout()
  const { top, left } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => item.area[layoutId],
    (animator, scroll, value) => animator.getPositions(value, scroll),
    [layoutId]
  );
  return { top: getItemTopStyle(top, layoutId ? item.area[layoutId].anchorSide : AnchorSide.Top), left };
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
