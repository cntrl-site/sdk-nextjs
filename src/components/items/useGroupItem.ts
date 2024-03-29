import { useKeyframeValue } from '../../common/useKeyframeValue';
import { GroupItem } from '@cntrl-site/sdk';
import { useLayoutContext } from '../useLayoutContext';

export function useGroupItem(item: GroupItem, sectionId: string) {
  const layoutId = useLayoutContext();
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

  return { opacity };
}
