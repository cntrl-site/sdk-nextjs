import { FC } from 'react';
import { TImageItem } from '@cntrl-site/core';
import { getLayoutStyles } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, layouts }) => (
  <LinkWrapper url={item.link?.url}>
    <>
      <div className={`image-wrapper-${item.id}`}>
        <img className="image" src={item.commonParams.url} />
      </div>
      <style jsx>{`
        ${getLayoutStyles(layouts, [item.layoutParams], ([{ strokeColor, radius, strokeWidth, opacity }]) => (`
           .image-wrapper-${item.id} {
              position: absolute;
              width: 100%;
              height: 100%;
              border-style: solid;
              box-sizing: border-box;
              border-color: ${strokeColor};
              border-radius: ${radius * 100}vw;
              opacity: ${opacity};
              border-width: ${strokeWidth * 100}vw;
            }`
          ))
        }
        .image {
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
