import { FC, useId, useMemo, useState } from 'react';
import { CntrlColor } from '@cntrl-site/color';
import { ArticleItemType, getLayoutStyles, RichTextItem as TRichTextItem } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useRichTextItemValues } from './useRichTextItemValues';
import { useRegisterResize } from "../../common/useRegisterResize";
import { getFontFamilyValue } from '../../utils/getFontFamilyValue';
import { useExemplary } from '../../common/useExemplary';
import { useItemAngle } from '../useItemAngle';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize }) => {
  const [content, styles] = useRichTextItem(item);
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { layouts } = useCntrlContext();
  const angle = useItemAngle(item, sectionId);
  const { blur, wordSpacing, letterSpacing, color } = useRichTextItemValues(item, sectionId);
  const textColor = useMemo(() => color ? CntrlColor.parse(color) : undefined, [color]);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state.hover];
  const exemplary = useExemplary();
  useRegisterResize(ref, onResize);

  return (
    <>
      <div
        ref={setRef}
        className={`rich-text-wrapper-${item.id}`}
        style={{
          ...(angle !== undefined  ? { transform: `rotate(${angle}deg)` } : {}),
          ...(blur !== undefined  ? { filter: `blur(${blur * exemplary}px)` } : {}),
          ...(letterSpacing !== undefined  ? { letterSpacing: `${letterSpacing * exemplary}px` } : {}),
          ...(wordSpacing !== undefined  ? { wordSpacing: `${wordSpacing * exemplary}px` }: {}),
          ...(textColor ? { color: `${textColor.toCss()}` } : {})
        }}
      >
        {content}
      </div>
      <JSXStyle id={id}>
        {styles}
        {`${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, hoverParams], exemplary) => {
          const color = CntrlColor.parse(layoutParams.color);
          return (`
            .rich-text-wrapper-${item.id} {
              font-size: ${Math.round(layoutParams.fontSize * exemplary)}px;
              line-height: ${layoutParams.lineHeight * exemplary}px;
              letter-spacing: ${layoutParams.letterSpacing * exemplary}px;
              word-spacing: ${layoutParams.wordSpacing * exemplary}px;
              font-family: ${getFontFamilyValue(layoutParams.typeFace)};
              font-weight: ${layoutParams.fontWeight};
              font-style: ${layoutParams.fontStyle ? layoutParams.fontStyle : 'normal'};
              vertical-align: ${layoutParams.verticalAlign};
              font-variant: ${layoutParams.fontVariant};
              color: ${color.fmt('rgba')};
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * exemplary}px)` : 'unset'};
              text-transform: ${layoutParams.textTransform};
              transition: ${getTransitions<ArticleItemType.RichText>(['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color'], hoverParams)};
            }
            .rich-text-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.RichText>(['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color'], hoverParams)};
            }
            @supports not (color: oklch(42% 0.3 90 / 1)) {
              .rich-text-wrapper-${item.id} {
                color: ${color.fmt('rgba')};
              }
            }
          `);
        })}`}
      </JSXStyle>
    </>
  );
};
