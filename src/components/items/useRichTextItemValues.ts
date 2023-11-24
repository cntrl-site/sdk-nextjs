import { useKeyframeValue } from '../../common/useKeyframeValue';
import { RichTextItem } from '@cntrl-site/sdk';
import { useLayoutContext } from '../useLayoutContext';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 1)';

export const useRichTextItemValues = (item: RichTextItem, sectionId: string) => {
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

  const letterSpacing = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'letterSpacing' in layoutParams ? layoutParams.letterSpacing : 0;
    },
    (animator, scroll, value) => animator.getLetterSpacing({ letterSpacing: value }, scroll).letterSpacing,
    sectionId,
    [layoutId]
  );

  const wordSpacing = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return 0;
      const layoutParams = item.layoutParams[layoutId];
      return 'wordSpacing' in layoutParams ? layoutParams.wordSpacing : 0;
    },
    (animator, scroll, value) => animator.getWordSpacing({ wordSpacing: value }, scroll).wordSpacing,
    sectionId,
    [layoutId]
  );

  const color = useKeyframeValue(
    item,
    (item, layoutId) => {
      if (!layoutId) return DEFAULT_COLOR;
      const layoutParams = item.layoutParams[layoutId];
      return 'color' in layoutParams ? layoutParams.color : DEFAULT_COLOR;
    },
    (animator, scroll, value) => animator.getTextColor({ color: value }, scroll).color,
    sectionId,
    [layoutId]
  );

  return { angle, blur, letterSpacing, wordSpacing, color };
};
