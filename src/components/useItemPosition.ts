import { TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useCurrentLayout } from '../common/useCurrentLayout';

export const useItemPosition = (item: TArticleItemAny, sectionId: string) => {
  const layoutId = useCurrentLayout();
  const { top, left } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => item.area[layoutId],
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId,
    [layoutId]
  );
  return { top, left };
};

