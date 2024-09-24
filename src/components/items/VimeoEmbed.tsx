import { FC, useEffect, useId, useMemo, useState } from 'react';
import Player from '@vimeo/player';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { useItemAngle } from '../useItemAngle';
import { getLayoutStyles, VimeoEmbedItem as TVimeoEmbedItem } from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useStatesClassNames } from '../useStatesClassNames';
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesTransitions } from '../useStatesTransitions';

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { radius, blur, opacity } = useEmbedVideoItem(item, sectionId);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const vimeoPlayer = useMemo(() => iframeRef ? new Player(iframeRef) : undefined, [iframeRef]);
  const angle = useItemAngle(item, sectionId);
  const { play, controls, loop, muted, pictureInPicture, url } = item.commonParams;
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [isCoverVisible, setIsCoverVisible] = useState(false);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state];
  const wrapperClassNames = useStatesClassNames(item.id, item.state, 'embed-video-wrapper');
  const videoClassNames = useStatesClassNames(item.id, item.state, 'embed-video');
  useRegisterResize(ref, onResize);
  // useStatesTransitions(ref, item.state, ['angle', 'blur', 'opacity']);
  // useStatesTransitions(iframeRef, item.state, ['radius']);
  const getValidVimeoUrl = (url: string): string => {
    const validURL = new URL(url);
    validURL.searchParams.append('controls', String(controls));
    validURL.searchParams.append('autoplay', String(play === 'auto'));
    validURL.searchParams.append('muted', String(play !== 'on-click' ? true : muted));
    validURL.searchParams.append('loop', String(loop));
    validURL.searchParams.append('pip', String(pictureInPicture));
    validURL.searchParams.append('title', '0');
    validURL.searchParams.append('byline', '0');
    validURL.searchParams.append('portrait', '0');
    validURL.searchParams.append('autopause', 'false');

    return validURL.href;
  }
  const validUrl = getValidVimeoUrl(url);

  useEffect(() => {
    if (!vimeoPlayer || !imgRef) return;
    if (play === 'on-click' && !controls) {
      setIsCoverVisible(true);
    }
    vimeoPlayer.on('pause', (e) => {
      if (e.seconds === 0) {
        setIsCoverVisible(true);
      }
    });
  }, [vimeoPlayer, imgRef]);

  const onCoverClick = () => {
    if (!vimeoPlayer || !imgRef) return;
    vimeoPlayer!.play();
    setIsCoverVisible(false);
  };

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`embed-video-wrapper-${item.id} ${wrapperClassNames}`}
        ref={setRef}
        style={{
          ...(opacity !== undefined ? { opacity } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
        }}
        onMouseEnter={() => {
          if (!vimeoPlayer || play !== 'on-hover') return;
          vimeoPlayer.play();
        }}
        onMouseLeave={() =>{
          if (!vimeoPlayer || play !== 'on-hover') return;
          vimeoPlayer.pause();
        }}
      >
        {item.commonParams.coverUrl && (
          <img
            ref={setImgRef}
            onClick={() => onCoverClick()}
            src={item.commonParams.coverUrl ?? ''}
            style={{
              display: isCoverVisible ? 'block' : 'none',
              cursor: 'pointer',
              position: 'absolute',
              objectFit: 'cover',
              height: '100%',
              width: '100%',
              top: '0',
              left: '0'
            }}
            alt="Cover img"
          />
        )}
        <iframe
          ref={setIframeRef}
          className={`embed-video ${videoClassNames}`}
          src={validUrl || ''}
          allow="autoplay; fullscreen; picture-in-picture;"
          allowFullScreen
          style={{
            ...(radius !== undefined  ? { borderRadius: `${radius * 100}vw` } : {})
          }}
        />
      </div>
      <JSXStyle id={id}>{`
      .embed-video-wrapper-${item.id} {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .embed-video {
        width: 100%;
        height: 100%;
        z-index: 1;
        border: none;
        overflow: hidden;
      }
      ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, stateParams]) => {
        const wrapperStatesCSS = getStatesCSS(item.id, 'embed-video-wrapper', ['angle', 'blur', 'opacity'], stateParams);
        const videoStatesCSS = getStatesCSS(item.id, 'embed-video', ['radius'], stateParams);
        return (`
          .embed-video-wrapper-${item.id} {
            opacity: ${layoutParams.opacity};
            transform: rotate(${area.angle}deg);
            filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
          }
          .embed-video-wrapper-${item.id} .embed-video {
            border-radius: ${layoutParams.radius * 100}vw;
          }
          ${wrapperStatesCSS}
          ${videoStatesCSS}
        `);
      })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
