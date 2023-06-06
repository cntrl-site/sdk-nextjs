import { TArticleItemAny } from '@cntrl-site/sdk';
import { useKeyframeValue } from '../common/useKeyframeValue';
import { useCurrentLayout } from '../common/useCurrentLayout';

export const useItemScale = (item: TArticleItemAny, sectionId: string) => {
  const layout = useCurrentLayout();
  const { scale } = useKeyframeValue(
    item,
    (item, layoutId) => ({ scale: layoutId ? item.area[layoutId].scale : 1 }),
    (animator, scroll, value) => animator.getScale(value, scroll),
    sectionId
  );
  const scaleAnchor = item.area[layout].scaleAnchor;

  return { scale, scaleAnchor };
};
