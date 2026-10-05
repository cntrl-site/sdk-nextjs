import {
  getLayoutStyles,
  HeaderElementKind,
  HeaderImageStructuredBlock,
  HeaderStructuredBlock,
  StructuredBlockAny,
  StructuredBlockType
} from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { blockPlacement } from '../StructuredBlockItem/blockPlacement';
import { blocksMap } from '../StructuredBlockItem/blocksMap';

interface Props {
  header: HeaderStructuredBlock;
  /** The section's blocks, the header's elements among them. */
  blocks: StructuredBlockAny[];
  readingWidth: Record<string, number>;
}

const TEXT_KINDS: HeaderElementKind[] = ['title', 'subtitle', 'date'];

/**
 * A content-based section's header, drawn first. Variant A draws the key image full width with the
 * other elements on its bottom edge, the image covering a share of the viewport's height if set to;
 * variant B flows the shown elements in order, each placed as in the stack. The variant, the order
 * and what is shown are a layout's, so every element is drawn once and arranged per layout.
 */
export const StructuredHeader: FC<Props> = ({ header, blocks, readingWidth }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const elementOf = (kind: HeaderElementKind) => blocks.find(block => block.id === header.commonParams[kind]);
  const image = elementOf('image');
  const hasImage = image?.type === StructuredBlockType.HeaderImage && Boolean((image as HeaderImageStructuredBlock).commonParams.url);
  const texts = TEXT_KINDS.flatMap((kind) => {
    const block = elementOf(kind);
    return block ? [{ kind, block }] : [];
  });
  const headerClass = `structured-header-${header.id}`;
  const stackClass = `structured-header-stack-${header.id}`;
  const elementClass = (block: StructuredBlockAny) => `structured-header-element-${block.id}`;
  const renderElement = (block: StructuredBlockAny) => {
    const BlockComponent = blocksMap[block.type];
    return (
      <div key={block.id} className={elementClass(block)}>
        <BlockComponent block={block} readingWidth={readingWidth} />
      </div>
    );
  };
  const elementStyles = (kind: HeaderElementKind, block: StructuredBlockAny) => getLayoutStyles(
    layouts,
    [header.layoutParams, block.area, block.layoutParams] as Record<string, any>[],
    ([layoutParams, area, blockLayoutParams]) => {
      const isBackdrop = kind === 'image' && layoutParams.variant === 'A';
      const isHidden = !isBackdrop && layoutParams.hiddenElements.includes(kind);
      const isCover = isBackdrop && layoutParams.imageFit === 'cover';
      return (`
        .${elementClass(block)} {
          display: ${isHidden ? 'none' : 'block'};
          position: relative;
          order: ${layoutParams.order.indexOf(kind)};
          ${isBackdrop
          ? `width: 100%; left: 0; height: ${isCover ? '100%' : 'auto'}; padding: 0;`
          : blockPlacement(area, blockLayoutParams)}
        }
        ${isBackdrop ? `
          .${elementClass(block)} .structured-caption-${block.id} {
            display: none;
          }
        ` : ''}
        ${isCover ? `
          .${elementClass(block)} .structured-header-image-${block.id},
          .${elementClass(block)} .structured-header-picture-${block.id} {
            height: 100%;
          }
          .${elementClass(block)} .structured-header-picture-${block.id} {
            object-fit: cover;
          }
        ` : ''}
      `);
    }
  );
  return (
    <div className={headerClass}>
      {image && renderElement(image)}
      <div className={stackClass}>
        {texts.map(({ block }) => renderElement(block))}
      </div>
      <JSXStyle id={`${reactId}-header-${header.id}`}>{`
        .${headerClass} {
          position: relative;
          width: 100%;
        }
        ${getLayoutStyles(layouts, [header.layoutParams, header.area] as Record<string, any>[], ([layoutParams, area]) => {
      const isA = layoutParams.variant === 'A';
      const isCover = isA && layoutParams.imageFit === 'cover';
      return (`
            .${headerClass} {
              display: ${isA ? 'block' : 'flex'};
              flex-direction: column;
              z-index: ${area?.zIndex ?? 0};
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
