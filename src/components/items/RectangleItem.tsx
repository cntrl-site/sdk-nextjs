import { FC, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { RectangleItem as TRectangleItem, getLayoutStyles } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useRegisterResize } from "../../common/useRegisterResize";
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesClassNames } from '../useStatesClassNames';
import { useStatesTransitions } from '../useStatesTransitions';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { fillColor, radius, strokeWidth, strokeColor, blur, backdropBlur } = useRectangleItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const backgroundColor = useMemo(() => fillColor ? CntrlColor.parse(fillColor) : undefined, [fillColor]);
  const borderColor = useMemo(() => strokeColor ? CntrlColor.parse(strokeColor) : undefined, [strokeColor]);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const statesClassNames = useStatesClassNames(item.id, item.state, 'rectangle');
  useRegisterResize(ref, onResize);
  const backdropFilterValue = backdropBlur ? `blur(${backdropBlur * 100}vw)`: undefined;
  useStatesTransitions(ref, item.state, ['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur']);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`rectangle-${item.id} ${statesClassNames}`}
          ref={setRef}
          style={{
            ...(backgroundColor ? { backgroundColor : `${backgroundColor.fmt('rgba')}` } : {}),
            ...(borderColor ? { borderColor: `${borderColor.fmt('rgba')}` } : {}),
            ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
            ...(strokeWidth !== undefined ? { borderWidth: `${strokeWidth * 100}vw` } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            ...(backdropFilterValue !== undefined
              ? { backdropFilter: backdropFilterValue, WebkitBackdropFilter: backdropFilterValue }
              : {}
            ),
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
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, states]) => {
          const statesCSS = getStatesCSS(item.id, 'rectangle', ['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur'], states);
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
              transition: all 0.2s ease;
            }
            ${statesCSS}
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
