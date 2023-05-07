import { FC } from 'react';
import { TYoutubeEmbedItem } from '@cntrl-site/core';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { getYoutubeId } from '../../utils/getValidYoutubeUrl';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';

export const YoutubeEmbedItem: FC<ItemProps<TYoutubeEmbedItem>> = ({ item }) => {
  const { autoplay, controls, url } = item.commonParams;
  const { radius } = useEmbedVideoItem(item);
  const angle = useItemAngle(item);

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
      <div className={`embed-youtube-video-wrapper-${item.id}`}
         style={{
           borderRadius: `${radius * 100}vw`,
           transform: `rotate(${angle}deg)`
         }}
      >
        <iframe
          className="embedYoutubeVideo"
          src={validUrl || ''}
          allow="accelerometer; autoplay; allowfullscreen;"
          allowFullScreen
        />
      </div>
      <style jsx>{`
        .embed-youtube-video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
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

