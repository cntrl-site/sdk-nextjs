import { FC } from 'react';
import { TVideoItem } from '@cntrl-site/core';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getLayoutStyles } from '@cntrl-site/sdk';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, layouts }) => (
  <LinkWrapper url={item.link?.url}>
    <>
      <div className={`video-wrapper-${item.id}`}>
        <video autoPlay muted loop playsInline className="video">
          <source src={item.commonParams.url} />
        </video>
      </div>
      <style jsx>{`
        ${getLayoutStyles(layouts, [item.layoutParams], ([{ strokeColor, radius, strokeWidth, opacity }]) => (`
           .video-wrapper-${item.id} {
              position: absolute;
              width: 100%;
              height: 100%;
              border-style: solid;
              box-sizing: border-box;
              border-color: ${strokeColor};
              border-radius: ${radius * 100}vw;
              border-width: ${strokeWidth * 100}vw;
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
    </>
  </LinkWrapper>
);
