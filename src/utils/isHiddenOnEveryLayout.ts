import { Layout } from '@cntrl-site/sdk';

/**
 * Whether an element is hidden on every layout, which leaves it out of the page altogether rather
 * than drawn and hidden on each: crawlers would still read it, and the page would carry it for nothing.
 */
export function isHiddenOnEveryLayout(hidden: Record<string, boolean> | undefined, layouts: Layout[]): boolean {
  return layouts.length > 0 && layouts.every(layout => hidden?.[layout.id] === true);
}
