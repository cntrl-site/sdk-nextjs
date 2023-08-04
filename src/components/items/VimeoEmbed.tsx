import { TVimeoEmbedItem } from '@cntrl-site/core';
import { getLayoutStyles } from '@cntrl-site/sdk';
import { FC } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { getItemClassName } from '../../utils/itemClassName';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, className }) => {
  const { layouts } = useCntrlContext();
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
      <div className={`${getItemClassName(item.id, 'style')} ${className ?? ''}`}>
        <iframe
          className={`embed-video-${item.id}`}
          src={validUrl || ''}
          allow="autoplay; fullscreen; picture-in-picture;"
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
  );
};
