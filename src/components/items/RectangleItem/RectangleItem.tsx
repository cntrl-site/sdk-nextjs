import { FC, useContext, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { RectangleItem as TRectangleItem, getLayoutStyles, FillLayer } from '@cntrl-site/sdk';
import { CntrlColor } from '@cntrl-site/color';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { getFill } from '../../../utils/getFill';
import { areFillsVisible } from '../../../utils/areFillsVisible/areFillsVisible';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const {
    fill: itemFill,
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeFill: itemStrokeFill,
    blur: itemBlur,
    backdropBlur: itemBackdropBlur
  } = useRectangleItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const stateParams = interactionCtrl?.getState<any>(['angle', 'strokeWidth', 'radius', 'blur', 'backdropBlur', 'strokeFill']);
  const stateFillParams = interactionCtrl?.getState<FillLayer[]>(['fill']);
  const stateFillLayers = stateFillParams?.styles?.fill;
  const solidTransition = stateFillParams?.transition ?? 'none';
  const styles = stateParams?.styles ?? {};
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  useItemGeometry(item.id, ref);
  const backdropBlur = getStyleFromItemStateAndParams(styles?.backdropBlur, itemBackdropBlur);
  const radius = getStyleFromItemStateAndParams(styles?.radius, itemRadius);
  const strokeWidth = getStyleFromItemStateAndParams(styles?.strokeWidth, itemStrokeWidth);
  const strokeFill = getStyleFromItemStateAndParams(styles?.strokeFill?.[0], itemStrokeFill?.[0]) ?? itemStrokeFill?.[0];
  const angle = getStyleFromItemStateAndParams(styles?.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(styles?.blur, itemBlur);
  const backdropFilterValue = backdropBlur ? `blur(${backdropBlur * 100}vw)` : undefined;
  const isInteractive = areFillsVisible(stateFillLayers ?? itemFill ?? [])
    || (strokeWidth !== 0 && strokeFill && strokeFill.value && CntrlColor.parse(strokeFill.value).getAlpha() !== 0);
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  const stroke = strokeFill
    ? getFill(strokeFill) ?? 'transparent'
    : 'transparent';

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`rectangle-${item.id}`}
          ref={setRef}
          style={{
            ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
            ...(backdropFilterValue !== undefined
              ? { backdropFilter: backdropFilterValue, WebkitBackdropFilter: backdropFilterValue }
              : {}
            ),
            transition: stateParams?.transition ?? 'none'
          }}
        >
          {itemFill && itemFill.map((fill, index) => {
            const stateFillLayer = stateFillLayers?.find((layer) => layer.id === fill.id);
            const value = stateFillLayer
              ? (getStyleFromItemStateAndParams<FillLayer>(stateFillLayer, fill) ?? fill)
              : fill;
            const background = value
              ? getFill(value) ?? 'transparent'
              : 'transparent';

            return (
              <Fill
                key={fill.id}
                fill={value}
                itemId={item.id}
                background={background}
                solidTransition={solidTransition}
                radius={radius}
                strokeWidth={strokeWidth}
                isHighest={index === itemFill.length - 1}
                borderColor={stroke}
              />
            );
          })}
        </div>
        <JSXStyle id={id}>{`
        .rectangle-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        },
        .image-fill-${item.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: center center;
          z-index: 1;
          background-position: center;
        },
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
      return (`
            .rectangle-${item.id} {
              border-radius: ${layoutParams.radius * 100}vw
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

function Fill({ fill, itemId, background, solidTransition, radius, strokeWidth, isHighest, borderColor }: {
  fill: FillLayer;
  itemId: string;
  background: string;
  solidTransition: string;
  radius: number;
  strokeWidth: number;
  isHighest: boolean;
  borderColor: string;
}) {
  const isRotatedImage = fill.type === 'image' && fill.rotation && fill.rotation !== 0;

  return (
    <div
      className={fill.type === 'image' ? `image-fill-${itemId}` : `fill-${itemId}`}
      style={{
        ...(fill.type === 'solid' ? { background, transition: solidTransition } : {}),
        ...(fill.type === 'image'
          ? {
              transform: `rotate(${fill.rotation}deg)`,
              backgroundImage: `url(${fill.src})`,
              backgroundSize: fill.behavior === 'repeat' ? `${fill.backgroundSize}%` : fill.behavior,
              backgroundRepeat: fill.behavior === 'repeat' ? 'repeat' : 'no-repeat',
              backgroundOrigin: 'border-box',
              opacity: fill.opacity
            }
          : { background }),
        position: 'absolute',
        mixBlendMode: fill.blendMode as any,
        borderRadius: `${radius * 100}vw`,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...(isHighest ? {
          borderColor,
          borderWidth: `${strokeWidth * 100}vw`,
          borderStyle: 'solid',
          boxSizing: 'border-box'
        } : {}),
        ...(isRotatedImage ? { overflow: 'hidden' } : {})
      }}
    >
    </div>
  );
};
