import { ItemAny, KeyframeType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';

export const useItemAngle = (item: ItemAny, sectionId: string) => {
  const angle = useKeyframeValue(
    item,
    KeyframeType.Rotation,
    (item, layoutId) => layoutId ? item.area[layoutId].angle : 0,
    (animator, scroll, value) => animator.getRotation({ angle: value }, scroll).angle,
    sectionId
  );
  return angle;
};

