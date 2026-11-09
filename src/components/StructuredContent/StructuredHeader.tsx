import {
  getLayoutStyles,
  HeaderElementKind,
  HeaderImageStructuredBlock,
  HeaderStructuredBlock,
  StructuredBlockAny,
  StructuredBlockType
} from '@cntrl-site/sdk';
import { FC, ReactNode, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { SCROLL_FADE_PROPERTY, SCROLL_FADE_ZOOM, useScrollFade } from '../../common/useScrollFade';
import { blockPlacement } from '../StructuredBlockItem/blockPlacement';
import { blocksMap, UnknownBlock } from '../StructuredBlockItem/blocksMap';

interface Props {
  header: HeaderStructuredBlock;
  /** The section's blocks, the header's elements among them. */
  blocks: StructuredBlockAny[];
  readingWidth: Record<string, number>;
}

const TEXT_KINDS: HeaderElementKind[] = ['title', 'subtitle', 'date'];

// an element a header stored before its kind was ordered goes last, not first
function orderOf(order: HeaderElementKind[], kind: HeaderElementKind): number {
  const index = order.indexOf(kind);
  return index === -1 ? order.length : index;
}

/**
 * A content-based section's header, drawn first. Variant A draws the key image full width with the
 * other elements on its bottom edge, the image covering a share of the viewport's height if set to,
 * staying put on the screen while the header scrolls over it if set to, and zooming in a little and
 * fading out as it scrolls off the screen if set to; variant B flows the
 * shown elements in order, each placed as in the stack. The variant, the order and what is shown
 * are a layout's, so every element is drawn once and arranged per layout. The elements stack in the
 * header by their own z-indexes, so the text can go under the image.
 */
export const StructuredHeader: FC<Props> = ({ header, blocks, readingWidth }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const elementOf = (kind: HeaderElementKind) => blocks.find(block => block.id === header.commonParams[kind]);
  const image = elementOf('image');
  const imageUrl = image?.type === StructuredBlockType.HeaderImage ? (image as HeaderImageStructuredBlock).commonParams.url : '';
  const hasImage = Boolean(imageUrl);
  const [imageElement, setImageElement] = useState<HTMLDivElement | null>(null);
  const isFading = hasImage && Object.values(header.layoutParams).some(params => params.variant === 'A' && params.fadeOnScroll);
  useScrollFade(imageElement, isFading);
  const texts = TEXT_KINDS.flatMap((kind) => {
    const block = elementOf(kind);
    return block ? [{ kind, block }] : [];
  });
  const headerClass = `structured-header-${header.id}`;
  const stackClass = `structured-header-stack-${header.id}`;
  const elementClass = (block: StructuredBlockAny) => `structured-header-element-${block.id}`;
  const pinClass = (block: StructuredBlockAny, part = '') => `structured-header-pin${part}-${block.id}`;
  const renderElement = (block: StructuredBlockAny, extra?: ReactNode, ref?: (element: HTMLDivElement | null) => void) => {
    const BlockComponent = blocksMap[block.type] ?? UnknownBlock;
    return (
      <div key={block.id} ref={ref} className={elementClass(block)}>
        <BlockComponent block={block} readingWidth={readingWidth} />
        {extra}
      </div>
    );
  };
  // a sticky backdrop, the way a section's fixed background is drawn: a screen-tall frame stuck
  // inside a track a screen longer at each end, clipped to the header; the picture itself only
  // sizes the header then
  const renderPin = (block: StructuredBlockAny) => (
    <div className={pinClass(block)}>
      <div className={pinClass(block, '-track')}>
        <div className={pinClass(block, '-frame')} style={{ backgroundImage: `url(${imageUrl})` }} />
      </div>
    </div>
  );
  const pinStyles = (block: StructuredBlockAny) => `
    .${pinClass(block)} {
      position: absolute;
      inset: 0;
      overflow: clip;
      pointer-events: none;
    }
    .${pinClass(block, '-track')} {
      position: relative;
      width: 100%;
      height: calc(100% + 200vh);
      transform: translateY(-100vh);
    }
    .${pinClass(block, '-frame')} {
      position: sticky;
      top: 100vh;
      width: 100%;
      height: 100vh;
      background-repeat: no-repeat;
    }
  `;
  const elementStyles = (kind: HeaderElementKind, block: StructuredBlockAny) => getLayoutStyles(
    layouts,
    [header.layoutParams, block.area, block.layoutParams] as Record<string, any>[],
    ([layoutParams, area, blockLayoutParams]) => {
      const isBackdrop = kind === 'image' && layoutParams.variant === 'A';
      const isHidden = !isBackdrop && layoutParams.hiddenElements.includes(kind);
      const isCover = isBackdrop && layoutParams.imageFit === 'cover';
      const isSticky = isBackdrop && Boolean(layoutParams.stickyImage);
      // the fading picture zooms inside the image's box, and whichever picture shows fades with the box
      const isFaded = isBackdrop && Boolean(layoutParams.fadeOnScroll);
      const fade = `var(${SCROLL_FADE_PROPERTY}, 0)`;
      // every value is written on every layout: the media queries stack upward, so a layout's
      // backdrop or cover would otherwise carry into the larger layouts drawn another way
      return (`
        .${elementClass(block)} {
          display: ${isHidden ? 'none' : 'block'};
          position: relative;
          z-index: ${area?.zIndex ?? 0};
          order: ${orderOf(layoutParams.order, kind)};
          ${isBackdrop
          ? `width: 100%; left: 0; height: ${isCover ? '100%' : 'auto'}; padding: 0;`
          : blockPlacement(area, blockLayoutParams)}
          ${kind === 'image' ? `overflow: ${isFaded ? 'clip' : 'visible'}; opacity: ${isFaded ? `calc(1 - ${fade})` : 1};` : ''}
        }
        .${elementClass(block)} .structured-caption-${block.id} {
          display: ${isBackdrop ? 'none' : 'block'};
        }
        .${elementClass(block)} .structured-header-image-${block.id},
        .${elementClass(block)} .structured-header-picture-${block.id} {
          height: ${isCover ? '100%' : 'auto'};
        }
        .${elementClass(block)} .structured-header-picture-${block.id} {
          object-fit: ${isCover ? 'cover' : 'fill'};
          visibility: ${isSticky ? 'hidden' : 'visible'};
        }
        ${kind === 'image'
          ? `
        .${pinClass(block)} {
          display: ${isSticky ? 'block' : 'none'};
        }
        .${pinClass(block, '-frame')} {
          background-size: ${isCover ? 'cover' : '100% auto'};
          background-position: ${isCover ? 'center' : 'top center'};
          opacity: ${blockLayoutParams?.opacity ?? 1};
        }
        .${elementClass(block)} .structured-header-image-${block.id},
        .${pinClass(block, '-frame')} {
          transform: ${isFaded ? `scale(calc(1 + ${SCROLL_FADE_ZOOM} * ${fade}))` : 'none'};
        }`
          : ''}
      `);
    }
  );
  return (
    <div className={headerClass}>
      {image && renderElement(image, hasImage && renderPin(image), setImageElement)}
      <div className={stackClass}>
        {texts.map(({ block }) => renderElement(block))}
      </div>
      <JSXStyle id={`${reactId}-header-${header.id}`}>{`
        .${headerClass} {
          position: relative;
          width: 100%;
        }
        ${image && hasImage ? pinStyles(image) : ''}
        ${getLayoutStyles(layouts, [header.layoutParams, header.area] as Record<string, any>[], ([layoutParams, area]) => {
      const isA = layoutParams.variant === 'A';
      const isCover = isA && layoutParams.imageFit === 'cover';
      return (`
            .${headerClass} {
              display: ${isA ? 'block' : 'flex'};
              flex-direction: column;
              z-index: ${area?.zIndex ?? 0};
              margin-top: ${area?.paddingTop ? `${area.paddingTop * 100}vw` : 0};
              height: ${isCover ? `${layoutParams.coverHeight * 100}vh` : 'auto'};
              height: ${isCover ? `${layoutParams.coverHeight * 100}svh` : 'auto'};
            }
            .${stackClass} {
              ${isA
          ? `display: flex; flex-direction: column; position: ${hasImage ? 'absolute' : 'relative'}; left: 0; right: 0; bottom: 0;`
          : 'display: contents;'}
            }
          `);
    })}
        ${image ? elementStyles('image', image) : ''}
        ${texts.map(({ kind, block }) => elementStyles(kind, block)).join('\n')}
      `}
      </JSXStyle>
    </div>
  );
};
