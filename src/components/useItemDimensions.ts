import { ItemAny, KeyframeType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useLayoutContext } from './useLayoutContext';

export const useItemDimensions = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const dimensions = useKeyframeValue<{ width: number; height: number } | undefined>(
    item,
    KeyframeType.Dimensions,
    (item, layoutId) => layoutId ? item.area[layoutId] : undefined,
    (animator, scroll, value) => value ? animator.getDimensions(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );
  return dimensions;
};
