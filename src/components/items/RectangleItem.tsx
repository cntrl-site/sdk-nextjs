import { CntrlColor, TRectangleItem, getLayoutStyles } from '@cntrl-site/sdk';
import { FC } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getItemClassName } from '../../utils/itemClassName';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, className }) => {
  const { layouts } = useCntrlContext();

  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`${getItemClassName(item.id, 'style')} ${className ?? ''}`} />
        <JSXStyle id={`richtext-${item.id}`}>
          {getLayoutStyles(layouts, [item.layoutParams], ([{ fillColor, radius, strokeColor, strokeWidth }]) => {
            const bgColor = CntrlColor.parse(fillColor);
            const sgColor = CntrlColor.parse(strokeColor);
            return `
              @supports not (color: oklch(42% 0.3 90 / 1)) {
                .${getItemClassName(item.id, 'style')} {
                  background-color: ${bgColor.fmt('rgba')};
                  border-color: ${sgColor.fmt('rgba')};
                }
              }
              .${getItemClassName(item.id, 'style')} {
                border-style: solid;
                box-sizing: border-box;
                background-color: ${bgColor.fmt('oklch')};
                border-color: ${sgColor.fmt('oklch')};
                border-radius: ${radius * 100}vw;
                border-width: ${strokeWidth * 100}vw;
              }
            `;
          })}
        </JSXStyle>
      </>
    </LinkWrapper>
  );
};
