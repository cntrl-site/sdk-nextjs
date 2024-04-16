import { KeyframeType, VimeoEmbedItem, YoutubeEmbedItem } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useLayoutContext } from '../useLayoutContext';

export const useEmbedVideoItem = (item: VimeoEmbedItem | YoutubeEmbedItem, sectionId: string) => {
  const layoutId = useLayoutContext();
  const radius = useKeyframeValue(
    item,
    KeyframeType.BorderRadius,
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

  return { radius, blur, opacity };
};
