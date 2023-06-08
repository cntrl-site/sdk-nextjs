import { CntrlColor, TImageItem, TVideoItem } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useCurrentLayout } from '../../common/useCurrentLayout';

const defaultColor = 'rgba(0, 0, 0, 1)';

export const useFileItem = (item: TImageItem | TVideoItem, sectionId: string) => {
  const layoutId = useCurrentLayout();
  const radius = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return  'radius' in layoutParams ? layoutParams.radius : 0;
    },
    (animator, scroll, value) => animator.getRadius({ radius: value }, scroll).radius,
    sectionId,
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
    sectionId,
    [layoutId]
  );

  const opacity = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'opacity' in layoutParams ? layoutParams.opacity : 0;
    },
    (animator, scroll, value) => animator.getOpacity({ opacity: value }, scroll).opacity,
    sectionId,
    [layoutId]
  );

  const strokeColor = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return defaultColor;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeColor' in layoutParams ? layoutParams.strokeColor : defaultColor;
    },
    (animator, scroll, value) => animator.getBorderColor({ color: value }, scroll).color,
    sectionId
  );

  return { radius, strokeWidth, opacity, strokeColor };
};
