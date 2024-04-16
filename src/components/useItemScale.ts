import { AreaAnchor, ItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useLayoutContext } from './useLayoutContext';

export const useItemScale = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const { scale } = useKeyframeValue(
    item,
    (item, layoutId) => ({ scale: layoutId ? item.area[layoutId].scale : 1 }),
    (animator, scroll, value) => animator.getScale(value, scroll),
    sectionId,
    [layoutId]
  );
  const scaleAnchor = layoutId ? item.area[layoutId].scaleAnchor : AreaAnchor.MiddleCenter;

  return { scale, scaleAnchor };
};
