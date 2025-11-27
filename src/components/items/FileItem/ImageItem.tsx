import { FC, useEffect, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { getLayoutStyles, ImageItem as TImageItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useImageFx } from '../../../utils/effects/useImageFx';
import { useElementRect } from '../../../utils/useElementRect';
import { useLayoutContext } from '../../useLayoutContext';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useItemFXData } from '../../../common/useItemFXData';
import { getFill } from '../../../utils/getFill';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const layoutId = useLayoutContext();
  const {
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    opacity: itemOpacity,
    strokeFill: itemStrokeFill,
    blur: itemBlur
  } = useFileItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(wrapperRef, onResize);
  useItemGeometry(item.id, wrapperRef);
  const { url, hasGLEffect } = item.commonParams;
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const isInitialRef = useRef(true);

  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const { controlsValues, fragmentShader } = useItemFXData(item, sectionId);
  const area = layoutId ? item.area[layoutId] : null;
  const exemplary = layouts?.find(l => l.id === layoutId)?.exemplary;
  const width = area && exemplary ? area.width * exemplary : 0;
  const height = area && exemplary ? area.height * exemplary : 0;
  const wrapperStateParams = interactionCtrl?.getState<number>(['angle', 'opacity', 'blur']);
  const imgStateParams = interactionCtrl?.getState<any>(['strokeWidth', 'radius', 'strokeFill']);
  useEffect(() => {
    isInitialRef.current = false;
  }, []);
  const isFXAllowed = useImageFx(
    fxCanvas.current,
    !!(hasGLEffect && !isInitialRef.current),
    {
      imageUrl: url,
      fragmentShader,
      controlsValues
    },
    width,
    height
  );
  const rect = useElementRect(wrapperRef);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const radius = getStyleFromItemStateAndParams(imgStateParams?.styles?.radius, itemRadius);
  const strokeWidth = getStyleFromItemStateAndParams(imgStateParams?.styles?.strokeWidth, itemStrokeWidth);
  const strokeFill = getStyleFromItemStateAndParams(imgStateParams?.styles?.strokeFill?.[0], itemStrokeFill?.[0]) ?? itemStrokeFill?.[0];
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);

  const stroke = strokeFill
    ? getFill(strokeFill) ?? 'transparent'
    : 'transparent';
  const inlineStyles = {
    ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
    ...(strokeWidth !== undefined ? {
      borderColor: stroke,
      borderWidth: `${strokeWidth * 100}vw`,
      borderRadius: radius !== undefined ? `${radius * 100}vw` : 'inherit',
      borderStyle: 'solid',
    } : {}),
    transition: imgStateParams?.transition ?? 'none'
  };
  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`image-wrapper-${item.id}`}
          ref={setWrapperRef}
          style={{
            ...(opacity !== undefined ? { opacity } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
            transition: wrapperStateParams?.transition ?? 'none'
          }}
        >
          {hasGLEffect && isFXAllowed
            ? (
                <canvas
                  style={inlineStyles}
                  ref={fxCanvas}
                  className={`img-canvas image-${item.id}`}
                  width={rectWidth}
                  height={rectHeight}
                />
              )
            : (
                <img
                  alt=""
                  className={`image image-${item.id}`}
                  style={inlineStyles}
                  src={item.commonParams.url}
                />
              )}
        </div>
        <JSXStyle id={id}>{`
        .image-wrapper-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: flex;
        }
        .image {
          width: 100%;
          height: 100%;
          opacity: 1;
          object-fit: cover;
          pointer-events: none;
          border-style: solid;
          overflow: hidden;
          box-sizing: border-box;
        }
        .img-canvas {
          border: solid;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-width: 0;
          box-sizing: border-box;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
      return (`
            .image-wrapper-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
            }
            .image-${item.id} {
              border: solid;
              border-color: ${stroke};
              border-radius: ${layoutParams.radius * 100}vw;
              border-width: ${layoutParams.strokeWidth * 100}vw;
            }
          `);
    })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
