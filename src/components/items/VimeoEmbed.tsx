import { FC } from 'react';
import { ItemProps } from '../Item';
import { TVimeoEmbedItem } from '@cntrl-site/core';
import { LinkWrapper } from '../LinkWrapper';
import { getLayoutStyles } from '@cntrl-site/sdk';

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, layouts }) => {
 const { autoplay, controls, loop, muted, pictureInPicture, url } = item.commonParams;
  const getValidVimeoUrl = (url: string): string => {
    const validURL = new URL(url);
    validURL.searchParams.append('autoplay', String(autoplay));
    validURL.searchParams.append('controls', String(controls));
    validURL.searchParams.append('muted', String(muted));
    validURL.searchParams.append('loop', String(loop));
    validURL.searchParams.append('pip', String(pictureInPicture));
    validURL.searchParams.append('title', '0');
    validURL.searchParams.append('byline', '0');
    validURL.searchParams.append('portrait', '0');

    return validURL.href;
  }
  const validUrl = getValidVimeoUrl(url);

  return (
    <LinkWrapper url={item.link?.url}>
        <div className={`embed-video-wrapper-${item.id}`}>
          <iframe
            className="embedVideo"
            src={validUrl || ''}
            allow="autoplay; fullscreen; picture-in-picture;"
            allowFullScreen
          />
        </div>
        <style jsx>{`
        ${getLayoutStyles(layouts, [item.layoutParams], ([{ radius }]) => (`
           .embed-video-wrapper-${item.id} {
              position: absolute;
              overflow: hidden;
              width: 100%;
              height: 100%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border-radius: ${radius * 100}vw;
            }`
        ))
        }
        .embedVideo {
          width: 100%;
          height: 100%;
          z-index: 1;
          border: none;
        }
      `}</style>
    </LinkWrapper>
  )
};
