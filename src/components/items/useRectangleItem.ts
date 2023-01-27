import { TRectangleItem } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useCurrentLayout } from '../../common/useCurrentLayout';

const defaultColor = 'rgba(0, 0, 0, 1)';

export const useRectangleItem = (item: TRectangleItem) => {
  const layoutId = useCurrentLayout();
  const radius = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return  'radius' in layoutParams ? layoutParams.radius : 0;
    },
    (animator, scroll, value) => animator.getRadius({ radius: value }, scroll).radius,
    [layoutId]
  );
  const strokeWidth = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeWidth' in layoutParams ? layoutParams.strokeWidth : 0;
    },
    (animator, scroll, value) => animator.getBorderWidth({ borderWidth: value }, scroll).borderWidth,
    [layoutId]
  );
  const fillColor = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return defaultColor;
      const layoutParams = item.layoutParams[layoutId];
      return 'fillColor' in layoutParams ? layoutParams.fillColor : defaultColor;
    },
    (animator, scroll, value) => animator.getColor({ color: value }, scroll).color
  );
  const strokeColor = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return defaultColor;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeColor' in layoutParams ? layoutParams.strokeColor : defaultColor;
    },
    (animator, scroll, value) => animator.getBorderColor({ color: value }, scroll).color
  );

  return { fillColor, strokeWidth, radius, strokeColor };
};
