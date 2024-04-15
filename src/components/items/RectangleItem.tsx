import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { RectangleItem as TRectangleItem, getLayoutStyles, ArticleItemType } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useLayoutContext } from '../useLayoutContext';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { fillColor, radius, strokeWidth, strokeColor, blur, backdropBlur } = useRectangleItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const backgroundColor = useMemo(() => CntrlColor.parse(fillColor), [fillColor]);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state.hover];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const backdropFilterValue = backdropBlur ? `blur(${backdropBlur * 100}vw)`: undefined;

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`rectangle-${item.id}`}
          ref={setRef}
          style={{
            backgroundColor: `${backgroundColor.fmt('rgba')}`,
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            borderColor: `${borderColor.toCss()}`,
            transform: `rotate(${angle}deg)`,
            filter: `blur(${blur * 100}vw)`,
            backdropFilter: backdropFilterValue,
            WebkitBackdropFilter: backdropFilterValue
          }}
        />
        <JSXStyle id={id}>{`
        .rectangle-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          border-style: solid;
          box-sizing: border-box;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, hoverParams]) => {
          return (`
            .rectangle-${item.id} {
              background-color: ${CntrlColor.parse(layoutParams.fillColor).fmt('rgba')};
              border-color: ${CntrlColor.parse(layoutParams.strokeColor).fmt('rgba')};
              border-radius: ${layoutParams.radius * 100}vw;
              border-width: ${layoutParams.strokeWidth * 100}vw;
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              backdrop-filter: ${layoutParams.backdropFilter !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              -webkit-backdrop-filter: ${layoutParams.backdropFilter !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              transition: ${getTransitions<ArticleItemType.Rectangle>(['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur'], hoverParams)};
            }
            .rectangle-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Rectangle>(['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur'], hoverParams)};
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
