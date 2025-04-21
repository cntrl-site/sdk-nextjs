import { ComponentItem, KeyframeType } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { useLayoutContext } from '../../useLayoutContext';

export function useComponentItem(item: ComponentItem, sectionId: string) {
  const layoutId = useLayoutContext();
  const opacity = useKeyframeValue(
    item,
    KeyframeType.Opacity,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'opacity' in layoutParams ? layoutParams.opacity : 1;
    },
    (animator, scroll, value) => value !== undefined ? animator.getOpacity({ opacity: value }, scroll).opacity : undefined,
    sectionId,
    [layoutId]
  );

  return {
    opacity
  };
}
