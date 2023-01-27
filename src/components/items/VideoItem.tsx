import { FC } from 'react';
import { TVideoItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item }) => {
  const { radius, strokeWidth, strokeColor, opacity } = useFileItem(item);
  return (
    <LinkWrapper url={item.link?.url}>
      <div className={`video-wrapper-${item.id}`}
         style={{
           borderRadius: `${radius * 100}vw`,
           borderWidth: `${strokeWidth * 100}vw`,
           opacity: `${opacity}`,
           borderColor: `${strokeColor}`
         }}
      >
        <video autoPlay muted loop playsInline className="video">
          <source src={item.commonParams.url} />
        </video>
      </div>
      <style jsx>{`
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
    `}</style>
    </LinkWrapper>
  );
};
