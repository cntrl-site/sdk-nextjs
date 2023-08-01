import { THoverParams, ArticleItemType, TItemHoverStatesMap, CntrlColor, AnchorSide } from '@cntrl-site/sdk';
import { getItemTopStyle } from '../getItemTopStyle';
import { ItemHoverState } from '@cntrl-site/core/src/article/ItemState';

type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;
type HoverParamsGetter = (value: any, anchorSide?: AnchorSide) => string;

const hoverTransformationMap: Record<keyof UnionToIntersection<ItemHoverState>, HoverParamsGetter> = {
  'width': (width: number) => `width: ${width * 100}vw !important;`,
  'height': (height: number) => `height: ${height * 100}vw !important;`,
  'top': (top: number, anchorSide?: AnchorSide) => `top: ${getItemTopStyle(top, anchorSide)} !important;`,
  'left': (left: number) => `left: ${left * 100}vw !important;`,
  'scale': (scale: number) => `transform: scale(${scale}) !important;`,
  'angle': (angle: number) => `transform: rotate(${angle}deg) !important;`,
  'opacity': (opacity: number) => `opacity: ${opacity} !important;`,
  'radius': (radius: number) => `border-radius: ${radius * 100}vw !important;`,
  'strokeWidth': (strokeWidth: number) => `border-width: ${strokeWidth * 100}vw !important;`,
  'strokeColor': (strokeColor: string) => `border-color: ${CntrlColor.parse(strokeColor).toCss()} !important;`,
  'fillColor': (fillColor: string) => `background-color: ${CntrlColor.parse(fillColor).toCss()} !important;`,
};

const CSSPropertyNameMap: Record<keyof UnionToIntersection<ItemHoverState>, string> = {
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
  'fillColor': 'background-color'
};

export function getTransitions<T extends ArticleItemType>(
  values: Array<keyof ItemHoverState>,
  hover?: TItemHoverStatesMap[T]
): string {
  if (!hover) return 'unset';
  const transitionValues = values.reduce<string[]>((acc, valueName) => {
    if (valueName in hover && hover[valueName] !== undefined) {
      const hoverProperties = hover[valueName] as THoverParams<string | number>;
      return [
        ...acc,
        `${CSSPropertyNameMap[valueName]} ${hoverProperties!.duration}ms ${hoverProperties!.timing} ${hoverProperties!.delay}ms`
      ];
    }
    return acc;
  }, []);
  if (!transitionValues.length) return 'unset';
  return transitionValues.join(', ');
}

export function getHoverStyles<T extends ArticleItemType>(
  values: Array<keyof UnionToIntersection<ItemHoverState>>,
  hover?: UnionToIntersection<ItemHoverState>,
  anchorSide?: AnchorSide
): string {
  if (!hover) return '';
  const hoverValues = values.reduce<string[]>((acc, valueName) => {
    if (valueName in hover && hover[valueName] !== undefined) {
      const hoverProperties = hover[valueName] as THoverParams<string | number>;
      return [
        ...acc,
        hoverTransformationMap[valueName](hoverProperties.value, anchorSide)
      ];
    }
    return acc;
  }, []);
  if (!hoverValues.length) return '';
  return hoverValues.join('\n');
}

