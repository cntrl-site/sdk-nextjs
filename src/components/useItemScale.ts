import { ScaleAnchor, ItemAny, KeyframeType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useLayoutContext } from './useLayoutContext';

export const useItemScale = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const data = useKeyframeValue(
    item,
    KeyframeType.Scale,
    (item, layoutId) => (layoutId ? { scale: item.area[layoutId].scale } : undefined),
    (animator, scroll, value) => value ? animator.getScale(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );

  return data ? data.scale : undefined;
};
