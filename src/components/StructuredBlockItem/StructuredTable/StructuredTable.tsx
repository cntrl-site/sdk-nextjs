import { getLayoutStyles, Layout, StructuredBlockTableCell, TableStructuredBlock } from '@cntrl-site/sdk';
import { FC, ReactNode, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { LIST_STYLES_ID, RichTextConverter } from '../../../utils/RichTextConverter/RichTextConverter';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { boxRule, colorRule, textStylesRule } from '../textStylesRule';
import { vw } from '../vw';

// the lines between the cells, in pixels of the layout, scaled with it like everything drawn in it
const BORDER_PX = 1;

const richTextConverter = new RichTextConverter();

/** Every cell as elements, with the styles of its ranges; the list styles once, where any cell has a list. */
function convertCells(block: TableStructuredBlock, layouts: Layout[]): { cells: Map<string, ReactNode[]>; rangeStyles: string; listStyles: string | undefined } {
  const { header, rows } = block.commonParams;
  const cells = new Map<string, ReactNode[]>();
  const rangeStyles: string[] = [];
  let listStyles: string | undefined;
  for (const cell of [...header, ...rows.flat()]) {
    const source = {
      id: `${block.id}-${cell.id}`,
      commonParams: cell,
      layoutParams: Object.fromEntries(layouts.map(layout => [layout.id, { rangeStyles: cell.styles[layout.id] ?? [], textAlign: block.layoutParams[layout.id].textAlign }]))
    };
    const [content, styles, lists] = richTextConverter.toHtml(source, layouts, { isScaledToViewport: false });
    cells.set(cell.id, content);
    rangeStyles.push(styles);
    listStyles ??= lists;
  }
  return { cells, rangeStyles: rangeStyles.join('\n'), listStyles };
}

/**
 * A table of one of three kinds, as served: its cells rich text set, spaced above and below and
 * lined in the styles it comes with, their ranges styled over them, each column padded on either
 * side as its own values say. Cells draw a heading row over a grid; rows draw every row plain, the
 * two fills alternating from the first; lines draw the heading and a line between each pair of rows
 * only. The table is drawn in a box, which grows out past its columns. On each layout it fills the
 * box, each column its share of it; or it is as wide as its columns, each as wide as it is set, and
 * scrolls sideways inside the box where it is wider than that.
 */
export const StructuredTable: FC<StructuredBlockItemProps<TableStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLTableElement | null>(null);
  useItemGeometry(block.id, ref);
  const { kind, header, rows } = block.commonParams;
  const { cells: content, rangeStyles, listStyles } = useMemo(() => convertCells(block, layouts), [block, layouts]);
  const headingAsRow = kind === 'rows';
  const Heading = headingAsRow ? 'td' : 'th';
  const table = `.structured-table-${block.id}`;
  const box = `.structured-table-box-${block.id}`;
  const scroller = `.structured-table-scroller-${block.id}`;
  const cells = `${table} th, ${table} td`;
  const cellContent = (cell: StructuredBlockTableCell) => content.get(cell.id);
  return (
    <>
      <div className={`structured-table-box-${block.id}`}>
        <div className={`structured-table-scroller-${block.id}`}>
          <table ref={setRef} className={`structured-table-${block.id}`}>
            <colgroup>
              {header.map((_, col) => <col key={col} />)}
            </colgroup>
            <thead className={`structured-table-heading-${block.id}`}>
              <tr>{header.map(cell => <Heading key={cell.id}>{cellContent(cell)}</Heading>)}</tr>
            </thead>
            <tbody className={`structured-table-body-${block.id}`}>
              {rows.map((row, index) => <tr key={row[0]?.id ?? index}>{row.map(cell => <td key={cell.id}>{cellContent(cell)}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {listStyles && <JSXStyle id={LIST_STYLES_ID}>{listStyles}</JSXStyle>}
      <JSXStyle id={`${reactId}-table-${block.id}`}>
        {rangeStyles}
        {`
        ${scroller} {
          overflow-y: hidden;
        }
        ${table} {
          table-layout: fixed;
          border-collapse: collapse;
        }
        ${cells} {
          box-sizing: border-box;
          vertical-align: top;
          text-align: inherit;
          font-weight: inherit;
          border-style: solid;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        ${getLayoutStyles(layouts, [block.layoutParams], ([layoutParams], exemplary) => {
      const border = vw(BORDER_PX / exemplary);
      const fill = (selector: string, color: string | undefined) => (color ? colorRule(selector, 'background-color', color) : '');
      // as wide as its columns where it scrolls, served with that width; its box's width where it fills it
      const isScrolling = layoutParams.sizing === 'scroll' && layoutParams.tableWidth !== undefined;
      return (`
            ${boxRule(box, layoutParams)}
            ${scroller} {
              overflow-x: ${isScrolling ? 'auto' : 'visible'};
            }
            ${table} {
              width: ${isScrolling ? vw(layoutParams.tableWidth) : '100%'};
            }
            ${textStylesRule(table, layoutParams)}
            ${cells} {
              padding-top: ${vw(layoutParams.cellPaddingTop)};
              padding-bottom: ${vw(layoutParams.cellPaddingBottom)};
              border-width: ${kind === 'lines' ? '0' : border};
            }
            ${kind === 'lines' ? `${table} tbody > tr > th, ${table} tbody > tr > td { border-top-width: ${border}; }` : ''}
            ${layoutParams.columns.map((column, index) => `
              ${table} col:nth-child(${index + 1}) {
                width: ${column.width * 100}%;
              }
              ${table} th:nth-child(${index + 1}), ${table} td:nth-child(${index + 1}) {
                padding-left: ${vw(column.paddingLeft)};
                padding-right: ${vw(column.paddingRight)};
              }
            `).join('')}
            ${layoutParams.borderColor ? colorRule(cells, 'border-color', layoutParams.borderColor) : ''}
            ${headingAsRow
          ? `${fill(`${table} thead tr, ${table} tbody tr:nth-child(even)`, layoutParams.headingBackground)}
                 ${fill(`${table} tbody tr:nth-child(odd)`, layoutParams.bodyBackground)}`
          : `${fill(`.structured-table-heading-${block.id}`, layoutParams.headingBackground)}
                 ${fill(`.structured-table-body-${block.id}`, layoutParams.bodyBackground)}`}
          `);
    })}
      `}
      </JSXStyle>
    </>
  );
};
