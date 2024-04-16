import { ScaleAnchor, ItemAny, KeyframeType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useLayoutContext } from './useLayoutContext';

export const useItemScale = (item: ItemAny, sectionId: string) => {
  const layoutId = useLayoutContext();
  const scale = useKeyframeValue(
    item,
    KeyframeType.Scale,
    (item, layoutId) => (layoutId ? item.area[layoutId].scale : undefined),
    (animator, scroll, value) => value !== undefined ? animator.getScale({ scale: value }, scroll).scale : undefined,
    sectionId,
    [layoutId]
  );

  return scale;
};
