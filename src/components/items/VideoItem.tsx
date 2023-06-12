import { FC, useId, useMemo } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor, TVideoItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId }) => {
  const id = useId();
  const { radius, strokeWidth, strokeColor, opacity } = useFileItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor).toCss(), [strokeColor]);
  return (
    <LinkWrapper url={item.link?.url}>
      <div className={`video-wrapper-${item.id}`}
         style={{
           borderRadius: `${radius * 100}vw`,
           borderWidth: `${strokeWidth * 100}vw`,
           opacity: `${opacity}`,
           borderColor: `${borderColor}`,
           transform: `rotate(${angle}deg)`
         }}
      >
        <video autoPlay muted loop playsInline className="video">
          <source src={item.commonParams.url} />
        </video>
      </div>
      <JSXStyle id={id}>{`
       .video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
          border-style: solid;
          box-sizing: border-box;
          border-color: ${strokeColor};
          opacity: ${opacity};
        }
        .video {
          width: 100%;
          height: 100%;
          opacity: 1;
          object-fit: cover;
          pointer-events: none;
        }
    `}</JSXStyle>
    </LinkWrapper>
  );
};
