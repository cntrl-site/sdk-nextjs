/** A share of the layout width as CSS: the layout is the viewport's width, so a share is so many `vw`. */
export function vw(share: number | undefined): string {
  return `${(share ?? 0) * 100}vw`;
}
