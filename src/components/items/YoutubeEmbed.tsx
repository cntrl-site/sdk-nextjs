import { TYoutubeEmbedItem } from '@cntrl-site/core';
import { getLayoutStyles } from '@cntrl-site/sdk';
import { FC } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getYoutubeId } from '../../utils/getValidYoutubeUrl';
import { getItemClassName } from '../../utils/itemClassName';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';

export const YoutubeEmbedItem: FC<ItemProps<TYoutubeEmbedItem>> = ({ item, className }) => {
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
      <div className={`${getItemClassName(item.id, 'style')} ${className ?? ''}`}>
        <iframe
          className={`embed-video-${item.id}`}
          src={validUrl || ''}
          allow="accelerometer; autoplay; allowfullscreen;"
          allowFullScreen
        />
      </div>
      <JSXStyle id={`embed-video-${item.id}`}>
        {getLayoutStyles(layouts, [item.layoutParams], ([{ radius }]) => {
          return `
            .${getItemClassName(item.id, 'style')} {
              position: absolute;
              overflow: hidden;
              width: 100%;
              height: 100%;
              border-radius: ${radius * 100}vw;
            }
          `;
        })}
        {`
          .embed-video-${item.id} {
            width: 100%;
            height: 100%;
            z-index: 1;
            border: none;
          }
        `}
      </JSXStyle>
    </LinkWrapper>
  )
};

