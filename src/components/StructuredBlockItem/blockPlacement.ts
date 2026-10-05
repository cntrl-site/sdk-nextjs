import { StructuredBlockArea } from '@cntrl-site/sdk';
import { parseSizing } from '../items/useSizing';

/**
 * Where a block sits in a column of blocks, as CSS declarations: on the content grid where it is
 * drawn from a preset, the area then carrying its `left` and its inner paddings; anywhere else sized
 * and aligned by itself.
 */
export function blockPlacement(area: StructuredBlockArea, layoutParams: object): string {
  const sizing = parseSizing('sizing' in layoutParams ? layoutParams.sizing as string | undefined : undefined);
  const height = sizing.y === 'manual' && area.height !== undefined ? `${area.height * 100}vw` : 'auto';
  if (area.left !== undefined) {
    return `
      align-self: flex-start;
      left: ${area.left * 100}vw;
      width: ${(area.width ?? 1) * 100}vw;
      height: ${height};
      padding-top: ${(area.innerPaddingTop ?? 0) * 100}vw;
      padding-bottom: ${(area.innerPaddingBottom ?? 0) * 100}vw;
    `;
  }
  return `
    align-self: ${getAlignSelf(area.alignment ?? 'center')};
    left: ${(area.horizontalOffset ?? 0) * 100}vw;
    width: ${sizing.x === 'manual' && area.width ? `${area.width * 100}vw` : 'max-content'};
    height: ${height};
  `;
}

function getAlignSelf(alignment: 'left' | 'center' | 'right') {
  switch (alignment) {
    case 'left':
      return 'flex-start';
    case 'right':
      return 'flex-end';
    default:
      return 'center';
  }
}
