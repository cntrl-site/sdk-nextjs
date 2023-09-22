import { FC, useEffect, useId, useState } from 'react';
import { ArticleItemType, CntrlColor, getLayoutStyles, TRichTextItem } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useRichTextItemValues } from './useRichTextItemValues';
import ResizeObserver from 'resize-observer-polyfill';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize }) => {
  const [content, styles] = useRichTextItem(item);
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { layouts } = useCntrlContext();
  const { angle, blur } = useRichTextItemValues(item, sectionId);

  useEffect(() => {
    if (!ref || !onResize) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      onResize(entry.target.getBoundingClientRect().height / window.innerWidth);
    });
    observer.observe(ref);
    return () => {
      observer.unobserve(ref);
    };
  }, [ref, onResize]);

  return (
    <>
      <div
        ref={setRef}
        className={`rich-text-wrapper-${item.id}`}
        style={{
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * 100}vw)`
        }}
      >
        {content}
      </div>
      <JSXStyle id={id}>
        {styles}
        {`${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .rich-text-wrapper-${item.id} {
              transition: ${getTransitions<ArticleItemType.RichText>(['angle', 'blur'], hoverParams)};
            }
            .rich-text-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.RichText>(['angle', 'blur'], hoverParams)}
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
                font-family: ${layoutParams.typeFace};
                font-weight: ${layoutParams.fontWeight};
                font-style: ${layoutParams.fontStyle ? layoutParams.fontStyle : 'normal'};
                text-decoration: ${layoutParams.textDecoration};
                vertical-align: ${layoutParams.verticalAlign};
                font-variant: ${layoutParams.fontVariant};
                color: ${color.toCss()};
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
