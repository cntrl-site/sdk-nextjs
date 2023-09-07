import { ScaleAnchor, TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useLayoutContext } from './useLayoutContext';

export const useItemScale = (item: TArticleItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const { scale } = useKeyframeValue(
    item,
    (item, layoutId) => ({ scale: layoutId ? item.area[layoutId].scale : 1 }),
    (animator, scroll, value) => animator.getScale(value, scroll),
    sectionId,
    [layoutId]
  );
  const scaleAnchor = layoutId ? item.area[layoutId].scaleAnchor : ScaleAnchor.MiddleCenter;

  return { scale, scaleAnchor };
};
