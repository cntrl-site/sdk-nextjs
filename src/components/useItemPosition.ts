import { TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useCurrentLayout } from '../common/useCurrentLayout';

const defaultArea = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  angle: 0,
  zIndex: 0
};

export const useItemPosition = (item: TArticleItemAny) => {
  const layoutId = useCurrentLayout();
  const { top, left } = useKeyframeValue<{ top: number; left: number }>(
    item,
    (item, layoutId) => layoutId ? item.area[layoutId] : defaultArea,
    (animator, scroll, value) => animator.getPositions(value, scroll),
    [layoutId]
  );
  return { top, left };
};

