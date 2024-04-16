import { CodeEmbedItem, AreaAnchor, KeyframeType } from '@cntrl-site/sdk';
import { useLayoutContext } from '../useLayoutContext';
import { useKeyframeValue } from '../../common/useKeyframeValue';

export const useCodeEmbedItem = (item: CodeEmbedItem, sectionId: string) => {
  const layoutId = useLayoutContext();

  const blur = useKeyframeValue(
    item,
    KeyframeType.Blur,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'blur' in layoutParams ? layoutParams.blur : 0;
    },
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
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

  const anchor = layoutId && 'areaAnchor' in item.layoutParams[layoutId] ? item.layoutParams[layoutId].areaAnchor : AreaAnchor.TopLeft;
  return { anchor, blur, opacity };
};
