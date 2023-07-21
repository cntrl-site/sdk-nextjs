import { FC, useId, useMemo } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor, TImageItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, sectionId }) => {
  const id = useId();
  const { radius, strokeWidth, opacity, strokeColor } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`image-wrapper-${item.id}`}
          style={{
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            opacity: `${opacity}`,
            borderColor: `${borderColor.toCss()}`,
            transform: `rotate(${angle}deg)`
          }}
        >
          <img className="image" src={item.commonParams.url} />
        </div>
        <JSXStyle id={id}>{`
        @supports not (color: oklch(42% 0.3 90 / 1)) {
          .image-wrapper-${item.id} {
            border-color: ${borderColor.fmt('rgba')};
          }
        }
         .image-wrapper-${item.id} {
            position: absolute;
            overflow: hidden;
            width: 100%;
            height: 100%;
            border-style: solid;
            box-sizing: border-box;
            display: flex;
          }
          .image {
            width: 100%;
            height: 100%;
            opacity: 1;
            object-fit: cover;
            pointer-events: none;
          }
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
