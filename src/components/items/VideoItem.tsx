import { CntrlColor, TVideoItem, getLayoutStyles } from '@cntrl-site/sdk';
import { FC, useMemo } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getItemClassName } from '../../utils/itemClassName';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useItemAngle } from '../useItemAngle';
import { useFileItem } from './useFileItem';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, className }) => {
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth, strokeColor, opacity } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor), [strokeColor]);
  return (
    <LinkWrapper url={item.link?.url}>
      <div
        className={`${getItemClassName(item.id, 'style')} ${className ?? ''}`}
        style={{
          borderRadius: `${radius * 100}vw`,
          borderWidth: `${strokeWidth * 100}vw`,
          opacity: `${opacity}`,
          borderColor: `${borderColor.toCss()}`,
          transform: `rotate(${angle}deg)`
        }}
      >
        <video autoPlay muted loop playsInline className={`video-${item.id}`}>
          <source src={item.commonParams.url} />
        </video>
      </div>
      <JSXStyle id={`video-${item.id}`}>
        {getLayoutStyles(layouts, [item.layoutParams], ([{ opacity, radius, strokeColor, strokeWidth }]) => {
          const stColor = CntrlColor.parse(strokeColor);
          return `
            @supports not (color: oklch(42% 0.3 90 / 1)) {
              .${getItemClassName(item.id, 'style')} {
                border-color: ${stColor.fmt('rgba')};
              }
            }
            .${getItemClassName(item.id, 'style')} {
              overflow: hidden;
              border-style: solid;
              box-sizing: box;
              border-color: ${stColor.fmt('oklch')};
              border-width: ${strokeWidth * 100}vw;
              border-radius: ${radius * 100}vw;
              opacity: ${opacity};
            }
          `;
        })}
        {`
          .video-${item.id} {
            width: 100%;
            height: 100%;
            opacity: 1;
            object-fit: cover;
            pointer-events: none;
          }
        `}
      </JSXStyle>
    </LinkWrapper>
  );
};
