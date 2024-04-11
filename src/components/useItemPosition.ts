import { AnchorSide, ItemAny, KeyframeType, PositionType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { getItemTopStyle } from '../utils/getItemTopStyle';
import { useLayoutContext } from './useLayoutContext';

export const useItemPosition = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const position = useKeyframeValue<{ top: number; left: number } | undefined>(
    item,
    KeyframeType.Position,
    (item, layoutId) => {
      if (!layoutId) return;
      return item.area[layoutId]
    },
    (animator, scroll, value) => value ? animator.getPositions(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );
  const anchorSide = layoutId ? item.area[layoutId].anchorSide : AnchorSide.Top;
  const positionType = layoutId ? item.area[layoutId].positionType : PositionType.ScreenBased;
  // tp prevent fixed item (with anchor point bottom) to jump when scroll in safari on mobile
  const isScreenBasedBottom = positionType === PositionType.ScreenBased && anchorSide === AnchorSide.Bottom;
  return position ? {
    bottom: isScreenBasedBottom ? `${-position.top * 100}vw` : 'unset',
    top:  isScreenBasedBottom ? 'unset' : getItemTopStyle(position.top, anchorSide),
    left: `${position.left * 100}vw`
  } : undefined;
};


