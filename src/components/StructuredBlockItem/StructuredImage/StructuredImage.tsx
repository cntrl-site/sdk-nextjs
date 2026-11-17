import { getLayoutStyles, getShownCaption, ImageStructuredBlock } from '@cntrl-site/sdk';
import { FC, useCallback, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { ImageLightbox } from '../../ImageLightbox/ImageLightbox';
import { useLayoutContext } from '../../useLayoutContext';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { BlockCaption } from '../BlockCaption/BlockCaption';

const GALLERY_GAP_PX = 8;
const HOVER_ZOOM = 1.03;

/**
 * A gallery: its images side by side in one row, each growing from nothing by its share of the row's
 * aspect ratios, so that they fill the row as their ratios do and come out equally tall, with the
 * caption under them. Until an image has loaded its ratio is taken to be square. A gallery that opens
 * in a lightbox on some layout makes each image a button, live on the layouts it does: there it opens
 * the image full screen, to step through the gallery's own images, and the image zooms a little under
 * the pointer, within its place in the row, to say so. The image opened moves out of its place in the
 * row into the lightbox, and the one shown when the lightbox closes moves back into its own.
 */
export const StructuredImage: FC<StructuredBlockItemProps<ImageStructuredBlock>> = ({ block, readingWidth }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const layoutId = useLayoutContext();
  const hasLightbox = Object.values(block.layoutParams).some(params => params.lightbox);
  // the layout is known once the page is on screen: until then the images open nothing
  const opensLightbox = layoutId !== undefined && Boolean(block.layoutParams[layoutId]?.lightbox);
  // a file the API could not resolve comes as an empty url: nothing to draw for it
  const pictures = block.commonParams.images.filter(({ url }) => url !== '');
  const caption = getShownCaption(block.commonParams);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openers = useRef<(HTMLButtonElement | null)[]>([]);
  const openerOf = useCallback((index: number) => openers.current[index] ?? null, []);
  // an image already loaded when the page hydrates fires no load event of its own
  const measure = useCallback((url: string, image: HTMLImageElement | null) => {
    if (!image || !image.complete || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    setRatios(prev => (prev[url] === ratio ? prev : { ...prev, [url]: ratio }));
  }, []);
  // growth factors summing to less than one leave part of the row empty, so a lone portrait image
  // would fill only its ratio of the block: each image grows by its share of the total instead
  const totalRatio = pictures.reduce((sum, { url }) => sum + (ratios[url] ?? 1), 0);
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  const images = pictures.map(({ url, altText }, index) => {
    const flexGrow = (ratios[url] ?? 1) / totalRatio;
    const image = (
      <img
        key={`${url}-${index}`}
        ref={image => measure(url, image)}
        className={`structured-gallery-image-${block.id}`}
        src={url}
        alt={altText}
        onLoad={event => measure(url, event.currentTarget)}
        style={hasLightbox ? undefined : { flexGrow }}
      />
    );
    if (!hasLightbox) return image;
    return (
      <button
        key={`${url}-${index}`}
        ref={(button) => {
          openers.current[index] = button;
        }}
        type="button"
        className={`structured-gallery-open-${block.id}`}
        aria-label={`Open image ${index + 1} of ${pictures.length}`}
        disabled={!opensLightbox}
        style={{ flexGrow }}
        onClick={() => setOpenIndex(index)}
      >
        {image}
      </button>
    );
  });
  return (
    <div ref={setRef} className={`structured-gallery-${block.id}`}>
      <div className={`structured-gallery-row-${block.id}`}>{images}</div>
      {caption && <BlockCaption blockId={block.id} caption={caption} layoutParams={block.layoutParams} readingWidth={readingWidth} />}
      {opensLightbox && openIndex !== null && (
        <ImageLightbox
          images={pictures.map(({ url, altText }) => ({ src: url, alt: altText }))}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          originOf={openerOf}
        />
      )}
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
        ${hasLightbox ? `
          .structured-gallery-open-${block.id} {
            display: block;
            flex-shrink: 1;
            flex-basis: 0;
            min-width: 0;
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: none;
            appearance: none;
            overflow: hidden;
            cursor: pointer;
          }
          .structured-gallery-open-${block.id}:disabled {
            cursor: default;
          }
          .structured-gallery-open-${block.id}:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
          }
          .structured-gallery-open-${block.id} > .structured-gallery-image-${block.id} {
            width: 100%;
            transition: transform 300ms ease;
          }
          @media (hover: hover) {
            .structured-gallery-open-${block.id}:not(:disabled):hover > .structured-gallery-image-${block.id} {
              transform: scale(${HOVER_ZOOM});
            }
          }
        ` : ''}
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
