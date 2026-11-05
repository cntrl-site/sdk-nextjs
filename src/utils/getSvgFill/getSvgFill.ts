import { FillLayer } from '@cntrl-site/sdk';
import { getFill } from '../getFill';

export function isSvgUrl(url: string): boolean {
  return /\.svg(?:[?#]|$)/i.test(url);
}

export function getSvgFill(fills: FillLayer[], url: string): { background: string; mask: string } {
  const svg = `url("${url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`;
  if (fills.length === 0) {
    return { background: `${svg} center / cover no-repeat`, mask: 'none' };
  }
  return { background: getFillsBackground(fills), mask: `${svg} no-repeat center / cover` };
}

function getFillsBackground(fills: FillLayer[]): string {
  const layers = fills
    .map(fill => ({ fill, value: getFill(fill) }))
    .filter((layer): layer is { fill: FillLayer; value: string } => !!layer.value && layer.value !== 'transparent');
  return layers
    .map(({ fill, value }, index) => {
      if (fill.type !== 'solid') return `${value} center / cover no-repeat`;
      return index === 0 ? value : `linear-gradient(${value}, ${value})`;
    })
    .reverse()
    .join(', ') || 'transparent';
}
