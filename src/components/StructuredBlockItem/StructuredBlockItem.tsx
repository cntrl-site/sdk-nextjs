import { getLayoutStyles, StructuredBlockAny } from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { blockPlacement } from './blockPlacement';
import { blocksMap, UnknownBlock } from './blocksMap';

export interface StructuredBlockItemProps<I extends StructuredBlockAny> {
  block: I;
  /** The section's reading column on each layout, which a caption keeps to. */
  readingWidth: Record<string, number>;
}

interface Props {
  block: StructuredBlockAny;
  readingWidth: Record<string, number>;
  /** Whether the block keeps the gap above it its area holds: a default section's blocks do, a content-based section's never. */
  hasGap: boolean;
}

export const StructuredBlockItem: FC<Props> = ({ block, readingWidth, hasGap }) => {
  const reactId = useId();
  const id = `${reactId}-item-${block.id}`;
  const { layouts } = useCntrlContext();
  const layoutValues: Record<string, any>[] = [block.area, block.layoutParams, block.hidden ?? {}];
  const BlockComponent = blocksMap[block.type] ?? UnknownBlock;
  return (
    <div className={`structured-block-item-${block.id}`}>
      <BlockComponent block={block} readingWidth={readingWidth} />
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, hidden]) => (`
          .structured-block-item-${block.id} {
            display: ${hidden ? 'none' : 'block'};
            position: relative;
            z-index: ${area.zIndex};
            margin-top: ${hasGap && area.paddingTop ? `${area.paddingTop * 100}vw` : 0};
            outline: none;
            ${blockPlacement(area, layoutParams)}
          }
        `))}
      `}
      </JSXStyle>
    </div>
  );
};
