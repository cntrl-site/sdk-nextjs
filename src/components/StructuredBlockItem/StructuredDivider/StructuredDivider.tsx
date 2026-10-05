import { DividerStructuredBlock, getLayoutStyles } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { colorRule } from '../textStylesRule';

/** A line filling its block, which is as tall as the line. */
export const StructuredDivider: FC<StructuredBlockItemProps<DividerStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  return (
    <>
      <div ref={setRef} className={`structured-divider-${block.id}`} />
      <JSXStyle id={`${reactId}-divider-${block.id}`}>{`
        .structured-divider-${block.id} {
          width: 100%;
          height: 100%;
        }
        ${getLayoutStyles(layouts, layoutValues, ([layoutParams]) => (
      colorRule(`.structured-divider-${block.id}`, 'background-color', layoutParams.color)
    ))}
      `}
      </JSXStyle>
    </>
  );
};
