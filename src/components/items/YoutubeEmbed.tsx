import { FC } from 'react';
import { getLayoutStyles } from '@cntrl-site/sdk';
import { TYoutubeEmbedItem } from '@cntrl-site/core';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getYoutubeId } from '../../utils/getValidYoutubeUrl';
import { useCntrlContext } from '../../provider/useCntrlContext';

export const YoutubeEmbedItem: FC<ItemProps<TYoutubeEmbedItem>> = ({ item }) => {
  const { layouts } = useCntrlContext();
  const { autoplay, controls, url } = item.commonParams;

  const getValidYoutubeUrl = (url: string): string => {
    const newUrl = new URL(url);
    const id = getYoutubeId(newUrl);
    const validUrl = new URL(`https://www.youtube.com/embed/${id}`);
    validUrl.searchParams.append('controls', `${ Number(controls) }`);
    validUrl.searchParams.append('autoplay', !controls ? 'true' : `${ Number(autoplay) }`);
    validUrl.searchParams.append('mute', `${ Number(autoplay) }`);

    return validUrl.href;
  }
  const validUrl = getValidYoutubeUrl(url);

  return (
    <LinkWrapper url={item.link?.url}>
      <div className={`embed-youtube-video-wrapper-${item.id}`}>
        <iframe
          className="embedYoutubeVideo"
          src={validUrl || ''}
          allow="accelerometer; autoplay; allowfullscreen;"
          allowFullScreen
        />
      </div>
      <style jsx>{`
        ${getLayoutStyles(layouts, [item.layoutParams], ([{ radius }]) => (`
          .embed-youtube-video-wrapper-${item.id} {
            position: absolute;
            overflow: hidden;
            width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: ${radius * 100}vw;
          }`
        ))}
        .embedYoutubeVideo {
          width: 100%;
          height: 100%;
          z-index: 1;
          border: none;
        }
      `}</style>
    </LinkWrapper>
  )
};

