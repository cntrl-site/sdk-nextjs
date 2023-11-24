import { ItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';

export const useItemAngle = (item: ItemAny, sectionId: string) => {
  const { angle } = useKeyframeValue(
    item,
    (item, layoutId) => ({ angle: layoutId ? item.area[layoutId].angle : 0 }),
    (animator, scroll, value) => animator.getRotation(value, scroll),
    sectionId
  );
  return angle;
};

