import { TArticleItemAny } from '@cntrl-site/sdk';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { useKeyframeValue } from '../common/useKeyframeValue';

const defaultArea = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  angle: 0,
  zIndex: 0
};

export const useItemDimensions = (item: TArticleItemAny, sectionId: string) => {
  const layoutId = useCurrentLayout();
  const { width, height } = useKeyframeValue<{ width: number; height: number }>(
    item,
    (item, layoutId) => layoutId ? item.area[layoutId] : defaultArea,
    (animator, scroll, value) => animator.getDimensions(value, scroll),
    sectionId,
    [layoutId]
  );
  return { width, height };
};
