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

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize }) => {
  const [content, styles] = useRichTextItem(item);
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { layouts } = useCntrlContext();
  const { angle, blur, wordSpacing, letterSpacing, color } = useRichTextItemValues(item, sectionId);
  const textColor = useMemo(() => CntrlColor.parse(color), [color]);
  const exemplary = useExemplary();
  useRegisterResize(ref, onResize);

  return (
    <>
      <div
        ref={setRef}
        className={`rich-text-wrapper-${item.id}`}
        style={{
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * exemplary}px)`,
          letterSpacing: `${letterSpacing * exemplary}px`,
          wordSpacing: `${wordSpacing * exemplary}px`,
          color: `${textColor.toCss()}`
        }}
      >
        {content}
      </div>
      <JSXStyle id={id}>
        {styles}
        {`${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .rich-text-wrapper-${item.id} {
              transition: ${getTransitions<ArticleItemType.RichText>(['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color'], hoverParams)};
            }
            .rich-text-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.RichText>(['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color'], hoverParams)}
            }
          `);
        })}`}
        {`${getLayoutStyles(layouts, [item.layoutParams], ([layoutParams], exemplary) => {
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
                color: ${color.toCss()};
                text-transform: ${layoutParams.textTransform};
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
