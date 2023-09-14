import { useKeyframeValue } from '../../common/useKeyframeValue';
import { TRichTextItem } from '@cntrl-site/sdk';
import { useLayoutContext } from '../useLayoutContext';

export const useRichTextItemValues = (item: TRichTextItem, sectionId: string) => {
  const layoutId = useLayoutContext();
  const { angle } = useKeyframeValue(
    item,
    (item, layoutId) => ({ angle: layoutId ? item.area[layoutId].angle : 0 }),
    (animator, scroll, value) => animator.getRotation(value, scroll),
    sectionId
  );

  const blur = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'blur' in layoutParams ? layoutParams.blur : 0;
    },
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId,
    [layoutId]
  );

  return { angle, blur };
};
