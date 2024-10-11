import { ArticleItemType, ItemState } from '@cntrl-site/sdk';

export const CSSPropertyNameMap: Record<keyof ItemState<ArticleItemType>, string> = {
  'width': 'width',
  'height': 'height',
  'top': 'top',
  'left': 'left',
  'scale': 'transform',
  'angle': 'transform',
  'opacity': 'opacity',
  'radius': 'border-radius',
  'strokeWidth': 'border-width',
  'strokeColor': 'border-color',
  'fillColor': 'background-color',
  'blur': 'filter',
  'backdropBlur': 'backdrop-filter',
  'letterSpacing': 'letter-spacing',
  'wordSpacing': 'word-spacing',
  'color': 'color'
};

const PropertyNameCSSMap: Record<string, string[]> = {
  'transform': ['angle', 'scale'],
  'border-radius': ['radius'],
  'border-width': ['strokeWidth'],
  'border-color': ['strokeColor'],
  'background-color': ['fillColor'],
  'filter': ['blur'],
  'backdrop-filter': ['backdrop-blur'],
  'letter-spacing': ['letterSpacing'],
  'word-spacing': ['wordSpacing'],
};


export function getStyleKeysFromCSSProperty(cssProp: string): string[] {
  const key = PropertyNameCSSMap[cssProp] ?? [cssProp];
  return key;
}
