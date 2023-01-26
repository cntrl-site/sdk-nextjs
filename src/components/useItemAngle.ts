import { TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';

export const useItemAngle = (item: TArticleItemAny) => {
  const { angle } = useKeyframeValue(
    item,
    (item, layoutId) => ({ angle: layoutId ? item.area[layoutId].angle : 0 }),
    (animator, scroll, value) => animator.getRotation(value, scroll)
  );
  return angle;
};

