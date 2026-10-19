import { getLayoutStyles, TableStructuredBlock } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { colorRule, textStylesRule } from '../textStylesRule';

// the lines between the cells, in pixels of the layout, scaled with it like everything drawn in it
const BORDER_PX = 1;

/** A heading row over body rows, the cells set, spaced and lined as the table is served, each row kind behind the fill it has. */
export const StructuredTable: FC<StructuredBlockItemProps<TableStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLTableElement | null>(null);
  useItemGeometry(block.id, ref);
  const { header, rows } = block.commonParams;
  const table = `.structured-table-${block.id}`;
  return (
    <>
      <table ref={setRef} className={`structured-table-${block.id}`}>
        <thead className={`structured-table-heading-${block.id}`}>
          <tr>{header.map((cell, col) => <th key={col}>{cell}</th>)}</tr>
        </thead>
        <tbody className={`structured-table-body-${block.id}`}>
          {rows.map((cells, row) => <tr key={row}>{cells.map((cell, col) => <td key={col}>{cell}</td>)}</tr>)}
        </tbody>
      </table>
      <JSXStyle id={`${reactId}-table-${block.id}`}>{`
        ${table} {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        ${table} th,
        ${table} td {
          box-sizing: border-box;
          vertical-align: top;
          text-align: inherit;
          border-style: solid;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        ${getLayoutStyles(layouts, [block.layoutParams], ([layoutParams], exemplary) => {
      const vw = (value: number) => `${value * 100}vw`;
      const cells = `${table} th, ${table} td`;
      return (`
            ${textStylesRule(table, layoutParams)}
            ${cells} {
              padding: ${vw(layoutParams.cellPaddingTop)} ${vw(layoutParams.cellPaddingRight)} ${vw(layoutParams.cellPaddingBottom)} ${vw(layoutParams.cellPaddingLeft)};
              border-width: ${vw(BORDER_PX / exemplary)};
            }
            ${layoutParams.borderColor ? colorRule(cells, 'border-color', layoutParams.borderColor) : ''}
            ${layoutParams.headingBackground ? colorRule(`.structured-table-heading-${block.id}`, 'background-color', layoutParams.headingBackground) : ''}
            ${layoutParams.bodyBackground ? colorRule(`.structured-table-body-${block.id}`, 'background-color', layoutParams.bodyBackground) : ''}
          `);
    })}
      `}
      </JSXStyle>
    </>
  );
};
