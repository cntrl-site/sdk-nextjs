import { FC, useEffect, useId, useState } from 'react';
import { ArticleItemType, getLayoutStyles, TRichTextItem } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useRichTextItemValues } from './useRichTextItemValues';
import ResizeObserver from 'resize-observer-polyfill';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize }) => {
  const [content, styles, preset] = useRichTextItem(item);
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { layouts } = useCntrlContext();
  const className = preset ? `cntrl-preset-${preset.id}` : undefined;
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
        className={`${className} rich-text-wrapper-${item.id}`}
        style={{
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * 100}vw)`
        }}
      >
        <div className="rich-text-scale" style={{
          transformOrigin: 'top left',
          transform: 'scale(var(--layout-deviation))'
        }}>
          {content}
        </div>
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
      </JSXStyle>
    </>
  );
};
