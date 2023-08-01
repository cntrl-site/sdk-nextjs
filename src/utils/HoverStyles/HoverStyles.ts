import { THoverParams, ArticleItemType, TItemHoverStatesMap, CntrlColor, AnchorSide } from '@cntrl-site/sdk';
import { getItemTopStyle } from '../getItemTopStyle';

const hoverTransformationMap = {
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

const CSSPropertyNameMap = {
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
  values: Array<keyof TItemHoverStatesMap[T]>,
  hover?: TItemHoverStatesMap[T]
): string {
  if (!hover) return 'unset';
  const transitionValues = values.reduce<string[]>((acc, valueName) => {
    if (valueName in hover && hover[valueName] !== undefined) {
      const hoverProperties = hover[valueName] as THoverParams<string | number>;
      return [
        ...acc,
        // @ts-ignore
        `${CSSPropertyNameMap[valueName]} ${hoverProperties!.duration}ms ${hoverProperties!.timing} ${hoverProperties!.delay}ms`
      ];
    }
    return acc;
  }, []);
  if (!transitionValues.length) return 'unset';
  return transitionValues.join(', ');
}

export function getHoverStyles<T extends ArticleItemType>(
  values: Array<keyof TItemHoverStatesMap[T]>,
  hover?: TItemHoverStatesMap[T],
  anchorSide?: AnchorSide
): string {
  if (!hover) return '';
  const hoverValues = values.reduce<string[]>((acc, valueName) => {
    if (valueName in hover && hover[valueName] !== undefined) {
      const hoverProperties = hover[valueName] as THoverParams<string | number>;
      return [
        ...acc,
        // @ts-ignore
        hoverTransformationMap[valueName](hoverProperties.value, anchorSide)
      ];
    }
    return acc;
  }, []);
  if (!hoverValues.length) return '';
  return hoverValues.join('\n');
}

