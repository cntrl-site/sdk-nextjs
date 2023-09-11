import { FC, useId, useMemo } from 'react';
import JSXStyle from 'styled-jsx/style';
import { TRectangleItem, CntrlColor, getLayoutStyles, ArticleItemType } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { fillColor, radius, strokeWidth, strokeColor, blur, backdropBlur } = useRectangleItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const backgroundColor = useMemo(() => CntrlColor.parse(fillColor), [fillColor]);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);

  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`rectangle-${item.id}`}
          style={{
            backgroundColor: `${backgroundColor.toCss()}`,
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            borderColor: `${borderColor.toCss()}`,
            transform: `rotate(${angle}deg)`,
            filter: blur !== 0 ? `blur(${blur * 100}vw)` : 'unset',
            backdropFilter: backdropBlur !== 0 ? `blur(${backdropBlur * 100}vw)`: 'unset'
          }}
        />
        <JSXStyle id={id}>{`
        @supports not (color: oklch(42% 0.3 90 / 1)) {
          .rectangle-${item.id} {
            background-color: ${backgroundColor.fmt('rgba')};
            border-color: ${borderColor.fmt('rgba')};
          }
        }
        .rectangle-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          border-style: solid;
          box-sizing: border-box;
        }
        ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .rectangle-${item.id} {
              transition: ${getTransitions<ArticleItemType.Rectangle>(['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur'], hoverParams)};
            }
            .rectangle-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Rectangle>(['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur'], hoverParams)}
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
