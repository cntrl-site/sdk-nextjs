import { ItemAny, KeyframeType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';

export const useItemAngle = (item: ItemAny, sectionId: string) => {
  const angle = useKeyframeValue(
    item,
    KeyframeType.Rotation,
    (item, layoutId) => layoutId ? item.area[layoutId].angle : undefined,
    (animator, scroll, value) => value ? animator.getRotation({ angle: value }, scroll).angle : undefined,
    sectionId
  );
  return angle;
};

