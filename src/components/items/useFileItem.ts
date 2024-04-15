import { ImageItem, KeyframeType, VideoItem } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useLayoutContext } from '../useLayoutContext';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 1)';
export const useFileItem = (item: ImageItem | VideoItem, sectionId: string) => {
  const layoutId = useLayoutContext();
  const radius = useKeyframeValue(
    item,
    KeyframeType.BorderRadius,
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
    KeyframeType.BorderWidth,
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
    KeyframeType.Opacity,
    (item, layoutId) => {
      if (!layoutId) return 1;
      const layoutParams = item.layoutParams[layoutId];
      return 'opacity' in layoutParams ? layoutParams.opacity : 1;
    },
    (animator, scroll, value) => animator.getOpacity({ opacity: value }, scroll).opacity,
    sectionId,
    [layoutId]
  );

  const strokeColor = useKeyframeValue(
    item,
    KeyframeType.BorderColor,
    (item, layoutId) => {
      if (!layoutId) return DEFAULT_COLOR;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeColor' in layoutParams ? layoutParams.strokeColor : DEFAULT_COLOR;
    },
    (animator, scroll, value) => animator.getBorderColor({ color: value }, scroll).color,
    sectionId
  );

  const blur = useKeyframeValue(
    item,
    KeyframeType.Blur,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'blur' in layoutParams ? layoutParams.blur : 0;
    },
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId
  );

  return { radius, strokeWidth, opacity, strokeColor, blur };
};
