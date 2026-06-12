import { getLayoutStyles, StructuredBlockAny, StructuredBlockType } from '@cntrl-site/sdk';
import { ComponentType, FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { parseSizing } from '../items/useSizing';
import { StructuredComponent } from './StructuredComponent/StructuredComponent';

export interface StructuredBlockItemProps<I extends StructuredBlockAny> {
  block: I;
}

interface Props {
  block: StructuredBlockAny;
  maxWidthMap: Record<string, number>;
}

const noop = () => null;

const itemsMap: Record<StructuredBlockType, ComponentType<StructuredBlockItemProps<any>>> = {
  [StructuredBlockType.Component]: StructuredComponent,
  [StructuredBlockType.RichText]: noop,
  [StructuredBlockType.Image]: noop,
  [StructuredBlockType.VimeoEmbed]: noop,
  [StructuredBlockType.YoutubeEmbed]: noop,
};

export const StructuredBlockItem: FC<Props> = ({ block, maxWidthMap }) => {
  const reactId = useId();
  const id = `${reactId}-item-${block.id}`;
  const { layouts } = useCntrlContext();
  const layoutValues: Record<string, any>[] = [block.area, block.layoutParams, block.hidden ?? {}, maxWidthMap];
  const ItemComponent = itemsMap[block.type] || noop;
  return (
    <div
      className={`structured-block-item-${block.id}`}
    >
      <ItemComponent block={block} />
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, hidden, maxWidth]) => {
          const sizingAxis = parseSizing(layoutParams.sizing);
          return (`
                .structured-block-item-${block.id} {
                  display: ${hidden ? 'none' : 'block'};
                  align-self: ${getAlignSelf(area.alignment ?? 'center')};
                  width: ${sizingAxis.x === 'manual' && area.width ? `${area.width * 100}vw` : maxWidth ?? 'max-content'};
                  height: ${sizingAxis.y === 'manual' && area.height ? `${area.height * 100}vw` : 'unset'};
                  padding-top: ${area.paddingTop ? `${area.paddingTop * 100}vw` : 'unset'};
                  outline: none;
                  left: ${(area.horizontalOffset ?? 0) * 100}vw;
                  position: relative;
                }
              `);
          })}
        `}
      </JSXStyle>
    </div>
  );
};

function getAlignSelf(alignment: 'left' | 'center' | 'right') {
  switch (alignment) {
    case 'left':
      return 'start';
    case 'right':
      return 'end';
    default:
      return 'center';
  }
}
