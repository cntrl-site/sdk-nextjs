import { useKeyframeValue } from '../../common/useKeyframeValue';
import { GroupItem, KeyframeType } from '@cntrl-site/sdk';
import { useLayoutContext } from '../useLayoutContext';

export function useGroupItem(item: GroupItem, sectionId: string) {
  const layoutId = useLayoutContext();
  const opacity = useKeyframeValue(
    item,
    KeyframeType.Opacity,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'opacity' in layoutParams ? layoutParams.opacity : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getOpacity({ opacity: value }, scroll).opacity : undefined,
    sectionId,
    [layoutId]
  );

  return { opacity };
}
