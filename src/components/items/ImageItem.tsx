import { CntrlColor, TImageItem, getLayoutStyles } from '@cntrl-site/sdk';
import { FC } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getItemClassName } from '../../utils/itemClassName';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, className }) => {
  const { layouts } = useCntrlContext();

  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`${getItemClassName(item.id, 'style')} ${className ?? ''}`}>
          <img className={`image-${item.id}`} src={item.commonParams.url} />
        </div>
        <JSXStyle id={`image-${item.id}`}>
          {getLayoutStyles(layouts, [item.layoutParams], ([{ opacity, radius, strokeColor, strokeWidth }]) => {
            const stColor = CntrlColor.parse(strokeColor);
            return `
              @supports not (color: oklch(42% 0.3 90 / 1)) {
                .${getItemClassName(item.id, 'style')} {
                  border-color: ${stColor.fmt('rgba')};
                }
              }

              .${getItemClassName(item.id, 'style')} {
                overflow: hidden;
                box-sizing: border-box;
                display: flex;
                border-color: ${stColor.fmt('oklch')};
                border-width: ${strokeWidth * 100}vw;
                border-radius: ${radius * 100}vw;
                opacity: ${opacity};
              }
            `;
          })}
          {`
            .image-${item.id} {
              width: 100%;
              height: 100%;
              opacity: 1;
              object-fit: cover;
              pointer-events: none;
            }
          `}
        </JSXStyle>
      </>
    </LinkWrapper>
  );
};
