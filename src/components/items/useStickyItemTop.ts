import { TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useLayoutContext } from '../useLayoutContext';

export function useStickyItemTop(item: TArticleItemAny, sectionHeightMap: Record<string, string>, sectionId: string) {
  const layoutId = useLayoutContext();
  const { top } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => {
      if (!layoutId) return { top: 0, left: 0 }
      return item.area[layoutId];
    },
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId,
    [layoutId]
  );
  const sticky = layoutId ? item.sticky[layoutId] : undefined;
  return sticky ? top - sticky.from : 0
}
