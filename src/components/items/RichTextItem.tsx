import { FC, useId, useMemo, useState } from 'react';
import { CntrlColor } from '@cntrl-site/color';
import { getLayoutStyles, RichTextItem as TRichTextItem } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useRichTextItemValues } from './useRichTextItemValues';
import { useRegisterResize } from "../../common/useRegisterResize";
import { getFontFamilyValue } from '../../utils/getFontFamilyValue';
import { useExemplary } from '../../common/useExemplary';
import { useItemAngle } from '../useItemAngle';
import { useStatesClassNames } from '../useStatesClassNames';
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesTransitions } from '../useStatesTransitions';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize }) => {
  const [content, styles] = useRichTextItem(item);
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { layouts } = useCntrlContext();
  const angle = useItemAngle(item, sectionId);
  const { blur, wordSpacing, letterSpacing, color, fontSize, lineHeight } = useRichTextItemValues(item, sectionId);
  const textColor = useMemo(() => color ? CntrlColor.parse(color) : undefined, [color]);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state];
  const exemplary = useExemplary();
  const stateClassNames = useStatesClassNames(item.id, item.state, 'rich-text-wrapper');
  useRegisterResize(ref, onResize);
  useStatesTransitions(ref, item.state, ['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color']);

  return (
    <>
      <div
        ref={setRef}
        className={`rich-text-wrapper-${item.id} ${stateClassNames}`}
        style={{
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          ...(textColor ? { color: `${textColor.fmt('rgba')}` } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          ...(letterSpacing !== undefined ? { letterSpacing: `${letterSpacing * exemplary}px` } : {}),
          ...(wordSpacing !== undefined ? { wordSpacing: `${wordSpacing * exemplary}px` } : {}),
          ...(fontSize !== undefined ? { fontSize: `${Math.round(fontSize * exemplary)}px` } : {}),
          ...(lineHeight !== undefined ? { lineHeight: `${lineHeight * exemplary}px` } : {}),
        }}
      >
        {content}
      </div>
      <JSXStyle id={id}>
        {styles}
        {`${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, states]) => {
          const color = CntrlColor.parse(layoutParams.color);
          const statesCSS = getStatesCSS(
            item.id,
            'rich-text-wrapper',
            ['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color'],
            states
          );
          return (`
            .rich-text-wrapper-${item.id} {
              font-size: ${layoutParams.fontSize * 100}vw;
              line-height: ${layoutParams.lineHeight * 100}vw;
              letter-spacing: ${layoutParams.letterSpacing * 100}vw;
              word-spacing: ${layoutParams.wordSpacing * 100}vw;
              font-family: ${getFontFamilyValue(layoutParams.typeFace)};
              font-weight: ${layoutParams.fontWeight};
              font-style: ${layoutParams.fontStyle ? layoutParams.fontStyle : 'normal'};
              vertical-align: ${layoutParams.verticalAlign};
              font-variant: ${layoutParams.fontVariant};
              color: ${color.fmt('rgba')};
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              text-transform: ${layoutParams.textTransform};
            }
            @supports not (color: oklch(42% 0.3 90 / 1)) {
              .rich-text-wrapper-${item.id} {
                color: ${color.fmt('rgba')};
              }
            }
            ${statesCSS}
          `);
        })}`}
      </JSXStyle>
    </>
  );
};
