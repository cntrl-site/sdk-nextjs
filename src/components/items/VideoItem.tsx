import { FC } from 'react';
import { TVideoItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getLayoutStyles } from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useFileItem } from './useFileItem';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item }) => {
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth } = useFileItem(item);
  return (
    <LinkWrapper url={item.link?.url}>
      <div className={`video-wrapper-${item.id}`}
         style={{
           borderRadius: `${radius * 100}vw`,
           borderWidth: `${strokeWidth * 100}vw`
         }}
      >
        <video autoPlay muted loop playsInline className="video">
          <source src={item.commonParams.url} />
        </video>
      </div>
      <style jsx>{`
      ${getLayoutStyles(layouts, [item.layoutParams], ([{ strokeColor, radius, strokeWidth, opacity }]) => (`
         .video-wrapper-${item.id} {
            position: absolute;
            overflow: hidden;
            width: 100%;
            height: 100%;
            border-style: solid;
            box-sizing: border-box;
            border-color: ${strokeColor};
            opacity: ${opacity};
          }`
      ))
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
