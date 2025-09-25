import { FC, useEffect, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { RectangleItem as TRectangleItem, getLayoutStyles } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const {
    fillColor: itemFillColor,
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeColor: itemStrokeColor,
    blur: itemBlur,
    backdropBlur: itemBackdropBlur
  } = useRectangleItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const stateParams = interactionCtrl?.getState(['angle', 'fillColor', 'strokeWidth', 'radius', 'strokeColor', 'blur', 'backdropBlur']);
  const styles = stateParams?.styles ?? {};
  const backgroundColor = useMemo(() => {
    const fillColor = getStyleFromItemStateAndParams(styles?.fillColor, itemFillColor);
    return fillColor ? CntrlColor.parse(fillColor) : undefined;
  }, [itemFillColor, styles?.fillColor]);
  const borderColor = useMemo(() => {
    const strokeColor = getStyleFromItemStateAndParams(styles?.strokeColor, itemStrokeColor);
    return strokeColor ? CntrlColor.parse(strokeColor) : undefined;
  }, [itemStrokeColor, styles?.strokeColor]);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const backdropBlur = getStyleFromItemStateAndParams(styles?.backdropBlur, itemBackdropBlur);
  const radius = getStyleFromItemStateAndParams(styles?.radius, itemRadius);
  const strokeWidth = getStyleFromItemStateAndParams(styles?.strokeWidth, itemStrokeWidth);
  const angle = getStyleFromItemStateAndParams(styles?.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(styles?.blur, itemBlur);
  const backdropFilterValue = backdropBlur ? `blur(${backdropBlur * 100}vw)` : undefined;
  const isInteractive = backgroundColor?.getAlpha() !== 0 || (strokeWidth !== 0 && borderColor?.getAlpha() !== 0);
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`rectangle-${item.id}`}
          ref={setRef}
          style={{
            ...(backgroundColor ? { backgroundColor: `${backgroundColor.fmt('rgba')}` } : {}),
            ...(borderColor ? { borderColor: `${borderColor.fmt('rgba')}` } : {}),
            ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
            ...(strokeWidth !== undefined ? { borderWidth: `${strokeWidth * 100}vw` } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
            ...(backdropFilterValue !== undefined
              ? { backdropFilter: backdropFilterValue, WebkitBackdropFilter: backdropFilterValue }
              : {}
            ),
            transition: stateParams?.transition ?? 'none'
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
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          return (`
            .rectangle-${item.id} {
              background-color: ${CntrlColor.parse(layoutParams.fillColor).fmt('rgba')};
              border-color: ${CntrlColor.parse(layoutParams.strokeColor).fmt('rgba')};
              border-radius: ${layoutParams.radius * 100}vw;
              border-width: ${layoutParams.strokeWidth * 100}vw;
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
              backdrop-filter: ${layoutParams.backdropBlur !== 0 ? `blur(${layoutParams.backdropBlur * 100}vw)` : 'unset'};
              -webkit-backdrop-filter: ${layoutParams.backdropBlur !== 0 ? `blur(${layoutParams.backdropBlur * 100}vw)` : 'unset'};
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
