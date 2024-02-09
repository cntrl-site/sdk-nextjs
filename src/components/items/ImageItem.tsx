import { FC, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { ArticleItemType, getLayoutStyles, ImageItem as TImageItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useImageFx } from '../../utils/effects/useImageFx';
import { useElementRect } from '../../utils/useElementRect';

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
  const { radius, strokeWidth, opacity, strokeColor, blur } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const { url, hasGLEffect, fragmentShader } = item.commonParams;
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const controls = item.commonParams.FXControls ?? [];
  const controlsVariables = controls.map((c) => `uniform ${c.type} ${c.shaderParam};`)
      .join('\n');
  const controlValues = controls.reduce<Record<string, ControlValue>>((acc, control) => {
    acc[control.shaderParam] = control.value;
    return acc;
  }, {});
  const fullShaderCode = `${baseVariables}\n${controlsVariables}\n${fragmentShader}`;
  console.log('fullShaderCode', fullShaderCode);
  console.log('controlValues', controlValues);
  useImageFx(fxCanvas.current, hasGLEffect ?? false, {
    imageUrl: url,
    fragmentShader: fullShaderCode,
    cursor: item.commonParams.FXCursor,
    controls: controlValues
  });
  const rect = useElementRect(ref);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const inlineStyles = {
    borderRadius: `${radius * 100}vw`,
    borderWidth: `${strokeWidth * 100}vw`,
    borderColor: `${borderColor.toCss()}`
  };
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`image-wrapper-${item.id}`}
          ref={setRef}
          style={{
            opacity: `${opacity}`,
            transform: `rotate(${angle}deg)`,
            filter: `blur(${blur * 100}vw)`
          }}
        >
          {item.commonParams.hasGLEffect ? (
            <canvas
              style={inlineStyles}
              ref={fxCanvas}
              className="img-canvas"
              width={rectWidth}
              height={rectHeight}
            />
          ) : (
            <img
              alt=""
              className={`image image-${item.id}`}
              style={inlineStyles}
              src={item.commonParams.url}
            />
          )}

        </div>
        <JSXStyle id={id}>{`
        @supports not (color: oklch(42% 0.3 90 / 1)) {
          .image-${item.id} {
            border-color: ${borderColor.fmt('rgba')};
          }
        }
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
        ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .image-wrapper-${item.id} {
              transition: ${getTransitions<ArticleItemType.Image>(['angle', 'opacity', 'blur'], hoverParams)};
            }
            .image-wrapper-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Image>(['angle', 'opacity', 'blur'], hoverParams)}
            }
            .image-${item.id} {
              transition: ${getTransitions<ArticleItemType.Image>(['strokeWidth', 'radius', 'strokeColor'], hoverParams)};
            }
            .image-wrapper-${item.id}:hover .image {
              ${getHoverStyles<ArticleItemType.Image>(['strokeWidth', 'radius', 'strokeColor'], hoverParams)}
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};

type ControlValue = number | [number, number];
