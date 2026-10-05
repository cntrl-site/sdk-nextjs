import { getLayoutStyles, ImageStructuredBlock } from '@cntrl-site/sdk';
import { FC, useCallback, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { BlockCaption } from '../BlockCaption/BlockCaption';

const GALLERY_GAP_PX = 8;

/**
 * A gallery: its images side by side in one row, each growing by its aspect ratio from nothing, so
 * that they share the row as their ratios do and come out equally tall, with the caption under them.
 * Until an image has loaded its ratio is taken to be square.
 */
export const StructuredImage: FC<StructuredBlockItemProps<ImageStructuredBlock>> = ({ block, readingWidth }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const { urls, altText, caption } = block.commonParams;
  const [ratios, setRatios] = useState<Record<string, number>>({});
  // an image already loaded when the page hydrates fires no load event of its own
  const measure = useCallback((url: string, image: HTMLImageElement | null) => {
    if (!image || !image.complete || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    setRatios(prev => (prev[url] === ratio ? prev : { ...prev, [url]: ratio }));
  }, []);
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  return (
    <div ref={setRef} className={`structured-gallery-${block.id}`}>
      <div className={`structured-gallery-row-${block.id}`}>
        {urls.map((url, index) => (
          <img
            key={`${url}-${index}`}
            ref={image => measure(url, image)}
            className={`structured-gallery-image-${block.id}`}
            src={url}
            alt={altText}
            onLoad={event => measure(url, event.currentTarget)}
            style={{ flexGrow: ratios[url] ?? 1 }}
          />
        ))}
      </div>
      {caption && <BlockCaption blockId={block.id} caption={caption} layoutParams={block.layoutParams} readingWidth={readingWidth} />}
      <JSXStyle id={`${reactId}-gallery-${block.id}`}>{`
        .structured-gallery-row-${block.id} {
          display: flex;
          align-items: flex-start;
          width: 100%;
          gap: var(--gallery-gap);
        }
        .structured-gallery-image-${block.id} {
          display: block;
          flex-shrink: 1;
          flex-basis: 0;
          min-width: 0;
          height: auto;
        }
        ${getLayoutStyles(layouts, layoutValues, ([layoutParams], exemplary) => (`
          .structured-gallery-${block.id} {
            --gallery-gap: ${GALLERY_GAP_PX / exemplary * 100}vw;
          }
          .structured-gallery-row-${block.id} {
            opacity: ${layoutParams.opacity};
          }
        `))}
      `}
      </JSXStyle>
    </div>
  );
};
