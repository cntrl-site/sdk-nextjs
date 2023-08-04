export function getItemClassName(
  itemId: string,
  type: 'position' | 'size' | 'sticky' | 'scale' | 'rotate' | 'style'
): string {
  return `item-${itemId}-${type}`;
}
