import { TVimeoEmbedItem, TYoutubeEmbedItem } from '@cntrl-site/core';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useLayoutContext } from '../useLayoutContext';

export const useEmbedVideoItem = (item: TVimeoEmbedItem | TYoutubeEmbedItem, sectionId: string) => {
  const layoutId = useLayoutContext();
  const radius = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'radius' in layoutParams ? layoutParams.radius : 0;
    },
    (animator, scroll, value) => animator.getRadius({ radius: value }, scroll).radius,
    sectionId,
    [layoutId]
  );
  const blur = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'blur' in layoutParams ? layoutParams.blur : 0;
    },
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId,
    [layoutId]
  );

  return { radius, blur };
};
