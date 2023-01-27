import { TVimeoEmbedItem, TYoutubeEmbedItem } from '@cntrl-site/core';
import { useCurrentLayout } from '../../common/useCurrentLayout';
import { useKeyframeValue } from '../../common/useKeyframeValue';

export const useEmbedVideoItem = (item: TVimeoEmbedItem | TYoutubeEmbedItem) => {
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

  return { radius };
};
