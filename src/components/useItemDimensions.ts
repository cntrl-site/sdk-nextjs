import { ItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useLayoutContext } from './useLayoutContext';

const defaultArea = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  angle: 0,
  zIndex: 0
};

export const useItemDimensions = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const { width, height } = useKeyframeValue<{ width: number; height: number }>(
    item,
    (item, layoutId) => layoutId ? item.area[layoutId] : defaultArea,
    (animator, scroll, value) => animator.getDimensions(value, scroll),
    sectionId,
    [layoutId]
  );
  return { width, height };
};
