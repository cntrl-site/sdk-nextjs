import { AnchorSide, ItemAny, PositionType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { getItemTopStyle } from '../utils/getItemTopStyle';
import { useLayoutContext } from './useLayoutContext';

export const useItemPosition = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const { top, left } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => {
      if (!layoutId) return { top: 0, left: -10 };
      return item.area[layoutId]
    },
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId,
    [layoutId]
  );
  const anchorSide = layoutId ? item.area[layoutId].anchorSide : AnchorSide.Top;
  const positionType = layoutId ? item.area[layoutId].positionType : PositionType.ScreenBased;
  const isScreenBasedBottom = positionType === PositionType.ScreenBased && anchorSide === AnchorSide.Bottom;
  return {
    bottom: isScreenBasedBottom ? `${-top * 100}vw` : 'unset',
    top:  isScreenBasedBottom ? 'unset' : getItemTopStyle(top, anchorSide),
    left: `${left * 100}vw`
  };
};


