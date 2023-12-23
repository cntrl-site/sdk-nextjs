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
  useImageFx(fxCanvas.current, hasGLEffect ?? false, {
    imageUrl: url,
    fragmentShader
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
