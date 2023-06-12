import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { TVimeoEmbedItem } from '@cntrl-site/core';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, sectionId }) => {
  const id = useId();
  const { radius } = useEmbedVideoItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const { autoplay, controls, loop, muted, pictureInPicture, url } = item.commonParams;
  const getValidVimeoUrl = (url: string): string => {
    const validURL = new URL(url);
    validURL.searchParams.append('controls', String(controls));
    validURL.searchParams.append('autoplay', !controls ? 'true' : String(autoplay));
    validURL.searchParams.append('muted', String(muted));
    validURL.searchParams.append('loop', String(loop));
    validURL.searchParams.append('pip', String(pictureInPicture));
    validURL.searchParams.append('title', '0');
    validURL.searchParams.append('byline', '0');
    validURL.searchParams.append('portrait', '0');
    validURL.searchParams.append('autopause', 'false');

    return validURL.href;
  }
  const validUrl = getValidVimeoUrl(url);

  return (
    <LinkWrapper url={item.link?.url}>
        <div className={`embed-video-wrapper-${item.id}`}
          style={{
            borderRadius: `${radius * 100}vw`,
            transform: `rotate(${angle}deg)`
          }}
        >
          <iframe
            className="embedVideo"
            src={validUrl || ''}
            allow="autoplay; fullscreen; picture-in-picture;"
            allowFullScreen
          />
        </div>
        <JSXStyle id={id}>{`
        .embed-video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        .embedVideo {
          width: 100%;
          height: 100%;
          z-index: 1;
          border: none;
        }
      `}</JSXStyle>
    </LinkWrapper>
  );
};
