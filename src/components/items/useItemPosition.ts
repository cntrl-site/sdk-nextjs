import { AnchorSide, ItemAny, KeyframeType, PositionType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { getItemTopStyle } from '../../utils/getItemTopStyle';
import { useLayoutContext } from '../useLayoutContext';

export const useItemPosition = (
  item: ItemAny,
  sectionId: string,
  stateValues: { top?: number; left?: number; }
) => {
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
  // to prevent fixed item (with anchor point bottom) to jump when scroll in safari on mobile
  if (!position) return undefined;
  const top = stateValues?.top ?? position.top;
  const left = stateValues?.left ?? position.left;
  return position ? {
    top,
    left
  } : undefined;

};


