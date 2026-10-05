import { getLayoutStyles, VimeoEmbedStructuredBlock } from '@cntrl-site/sdk';
import Player from '@vimeo/player';
import { FC, useEffect, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { getVimeoEmbedUrl } from '../../../utils/getVimeoEmbedUrl';
import { useLayoutContext } from '../../useLayoutContext';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { embedFrameStyles } from './embedFrameStyles';

/** A Vimeo video playing as the Vimeo item does, its cover over it until it plays. */
export const StructuredVimeoEmbed: FC<StructuredBlockItemProps<VimeoEmbedStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const layoutId = useLayoutContext();
  const layoutParams = layoutId ? block.layoutParams[layoutId] : null;
  const { url, coverUrl } = block.commonParams;
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const player = useMemo(() => (iframe ? new Player(iframe) : undefined), [iframe]);
  const [isCoverVisible, setIsCoverVisible] = useState(coverUrl !== null);
  useItemGeometry(block.id, ref);
  const src = useMemo(() => (layoutParams ? getVimeoEmbedUrl(url, layoutParams) : url), [url, layoutParams]);

  useEffect(() => {
    if (!player || !layoutParams) return;
    setIsCoverVisible(layoutParams.play !== 'auto' && coverUrl !== null);
    const showCover = () => setIsCoverVisible(coverUrl !== null);
    const handlePause = ({ seconds }: { seconds: number }) => {
      if (seconds === 0) showCover();
    };
    player.on('pause', handlePause);
    player.on('ended', showCover);
    return () => {
      player.off('pause', handlePause);
      player.off('ended', showCover);
    };
  }, [player, layoutParams, coverUrl]);

  const play = () => {
    setIsCoverVisible(false);
    player?.play();
  };
  const togglePlay = async () => {
    if (!player) return;
    if (await player.getPaused()) {
      play();
    } else {
      player.pause();
    }
  };

  const layoutValues: Record<string, any>[] = [block.area, block.layoutParams];
  return (
    <div
      ref={setRef}
      className={`structured-embed-${block.id}`}
      onMouseEnter={() => {
        if (layoutParams?.play === 'on-hover' && !isCoverVisible) player?.play();
      }}
      onMouseLeave={() => {
        if (layoutParams?.play === 'on-hover') player?.pause();
      }}
    >
      {coverUrl && isCoverVisible && (
        <img
          className={`structured-embed-cover-${block.id}`}
          src={coverUrl}
          alt=""
          onClick={layoutParams?.play === 'on-click' ? play : undefined}
          onMouseEnter={layoutParams?.play === 'on-hover' ? play : undefined}
        />
      )}
      {/* an iframe swallows its clicks, so they are caught over it */}
      {layoutParams && !layoutParams.controls && (layoutParams.play === 'on-click' || layoutParams.play === 'auto') && (
        <div className={`structured-embed-overlay-${block.id}`} onClick={togglePlay} />
      )}
      <iframe
        ref={setIframe}
        className={`structured-embed-frame-${block.id}`}
        src={src}
        allow="autoplay; fullscreen; picture-in-picture;"
        allowFullScreen
      />
      <JSXStyle id={`${reactId}-vimeo-${block.id}`}>{`
        ${embedFrameStyles(block.id)}
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => (`
          .structured-embed-${block.id} {
            ${area.height === undefined ? 'aspect-ratio: 16 / 9;' : 'height: 100%;'}
            opacity: ${layoutParams.opacity};
          }
          .structured-embed-frame-${block.id} {
            border-radius: ${layoutParams.radius * 100}vw;
          }
        `))}
      `}
      </JSXStyle>
    </div>
  );
};
