import { KeyframeType, RectangleItem } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { useLayoutContext } from '../../useLayoutContext';

const defaultColor = 'rgba(0, 0, 0, 1)';

export function useRectangleItem(item: RectangleItem, sectionId: string) {
  const layoutId = useLayoutContext();
  const radius = useKeyframeValue(
    item,
    KeyframeType.BorderRadius,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'radius' in layoutParams ? layoutParams.radius : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getRadius({ radius: value }, scroll).radius : undefined,
    sectionId,
    [layoutId]
  );
  const strokeWidth = useKeyframeValue(
    item,
    KeyframeType.BorderWidth,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeWidth' in layoutParams ? layoutParams.strokeWidth : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getBorderWidth({ borderWidth: value }, scroll).borderWidth : undefined,
    sectionId,
    [layoutId]
  );
  const fillColor = useKeyframeValue(
    item,
    KeyframeType.Color,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'fillColor' in layoutParams ? layoutParams.fillColor : defaultColor;
    },
    (animator, scroll, value) => value ? animator.getColor({ color: value }, scroll).color : undefined,
    sectionId,
    [layoutId]
  );
  const strokeColor = useKeyframeValue(
    item,
    KeyframeType.BorderColor,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeColor' in layoutParams ? layoutParams.strokeColor : defaultColor;
    },
    (animator, scroll, value) => value ? animator.getBorderColor({ color: value }, scroll).color : undefined,
    sectionId,
    [layoutId]
  );
  const blur = useKeyframeValue(
    item,
    KeyframeType.Blur,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'blur' in layoutParams ? layoutParams.blur : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getBlur({ blur: value }, scroll).blur : undefined,
    sectionId,
    [layoutId]
  );
  const backdropBlur = useKeyframeValue(
    item,
    KeyframeType.BackdropBlur,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'backdropBlur' in layoutParams ? layoutParams.backdropBlur : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getBackdropBlur({ backdropBlur: value }, scroll).backdropBlur : undefined,
    sectionId,
    [layoutId]
  );
  return { fillColor, strokeWidth, radius, strokeColor, blur, backdropBlur };
}
