import { TArticleItemAny } from '@cntrl-site/sdk';
import { useCurrentLayout } from '../../common/useCurrentLayout';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { getAnchoredItemTop } from '../Item';

export function useStickyItemTop(item: TArticleItemAny, sectionHeightMap: Record<string, string>, sectionId: string) {
  const layoutId = useCurrentLayout();
  const { top } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => item.area[layoutId],
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId,
    [layoutId]
  );
  const sticky = item.sticky[layoutId];
  const sectionHeight = sectionHeightMap[layoutId];
  return sticky ? `${getAnchoredItemTop(top - sticky.from, sectionHeight, item.area[layoutId].anchorSide)}` : 0
}
