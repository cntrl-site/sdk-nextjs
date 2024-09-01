import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { getLayoutStyles, ImageItem as TImageItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useImageFx } from '../../utils/effects/useImageFx';
import { useElementRect } from '../../utils/useElementRect';
import { useLayoutContext } from '../useLayoutContext';
import { useStatesClassNames } from '../useStatesClassNames';
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesTransitions } from '../useStatesTransitions';

const baseVariables = `precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_pattern;
uniform vec2 u_imgDimensions;
uniform vec2 u_patternDimensions;
uniform float u_time;
uniform vec2 u_cursor;
varying vec2 v_texCoord;`;

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const layoutId = useLayoutContext();
  const { radius, strokeWidth, opacity, strokeColor, blur } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => strokeColor ? CntrlColor.parse(strokeColor) : undefined, [strokeColor]);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  useRegisterResize(wrapperRef, onResize);
  const { url, hasGLEffect, fragmentShader, FXControls, FXCursor } = item.commonParams;
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const isInitialRef = useRef(true);
  const controls = FXControls ?? [];
  const controlsVariables = controls.map((c) => `uniform ${c.type} ${c.shaderParam};`)
      .join('\n');
  const controlValues = controls.reduce<Record<string, ControlValue>>((acc, control) => {
    acc[control.shaderParam] = control.value;
    return acc;
  }, {});
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state];
  const fullShaderCode = `${baseVariables}\n${controlsVariables}\n${fragmentShader}`;
  const area = layoutId ? item.area[layoutId] : null;
  const exemplary = layouts?.find(l => l.id === layoutId)?.exemplary;
  const width = area && exemplary ? area.width * exemplary : 0;
  const height = area && exemplary ? area.height * exemplary : 0;
  const statesWrapperClassNames = useStatesClassNames(item.id, item.state, 'image-wrapper');
  const statesImgClassNames = useStatesClassNames(item.id, item.state, 'image');
  useStatesTransitions(wrapperRef, item.state, ['angle', 'opacity', 'blur']);
  useStatesTransitions(imgRef, item.state, ['strokeWidth', 'radius', 'strokeColor']);
  useStatesTransitions(fxCanvas.current, item.state, ['strokeWidth', 'radius', 'strokeColor']);
  useEffect(() => {
    isInitialRef.current = false;
  }, []);
  const isFXAllowed = useImageFx(
    fxCanvas.current,
    !!(hasGLEffect && !isInitialRef.current),
    {
      imageUrl: url,
      fragmentShader: fullShaderCode,
      cursor: FXCursor,
      controls: controlValues
    },
    width,
    height
  );
  const rect = useElementRect(wrapperRef);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const inlineStyles = {
    ...(borderColor ? { borderColor: `${borderColor.fmt('rgba')}` } : {}),
    ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
    ...(strokeWidth !== undefined ? { borderWidth: `${strokeWidth * 100}vw` } : {}),
  };
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`image-wrapper-${item.id} ${statesWrapperClassNames}`}
          ref={setWrapperRef}
          style={{
            ...(opacity !== undefined ? { opacity } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          }}
        >
          {hasGLEffect && isFXAllowed ? (
            <canvas
              style={inlineStyles}
              ref={fxCanvas}
              className={`img-canvas image-${item.id} ${statesImgClassNames}`}
              width={rectWidth}
              height={rectHeight}
            />
          ) : (
            <img
              alt=""
              className={`image image-${item.id} ${statesImgClassNames}`}
              style={inlineStyles}
              ref={setImgRef}
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
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, stateParams]) => {
          const wrapperStatesCSS = getStatesCSS(item.id, 'image-wrapper', ['angle', 'opacity', 'blur'], stateParams);
          const imgStatesCSS = getStatesCSS(item.id, 'image', ['strokeWidth', 'radius', 'strokeColor'], stateParams);
          return (`
            .image-wrapper-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              transition: all 0.2s ease;
            }
            .image-${item.id} {
              border-color: ${CntrlColor.parse(layoutParams.strokeColor).fmt('rgba')};
              border-radius: ${layoutParams.radius * 100}vw;
              border-width: ${layoutParams.strokeWidth * 100}vw;
              transition: all 0.2s ease;
            }
            ${wrapperStatesCSS}
            ${imgStatesCSS}
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};

type ControlValue = number | [number, number];
