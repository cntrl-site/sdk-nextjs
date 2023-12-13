import { FC, useId, useMemo, useState } from 'react';
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

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth, opacity, strokeColor, blur } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
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
          <img
            className={`image image-${item.id}`}
            style={{
              borderRadius: `${radius * 100}vw`,
              borderWidth: `${strokeWidth * 100}vw`,
              borderColor: `${borderColor.toCss()}`
            }}
            src={item.commonParams.url}
          />
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
