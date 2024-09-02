import { StateParams, ArticleItemType, AnchorSide, ItemState, ItemStatesMap } from '@cntrl-site/sdk';
import { CntrlColor } from '@cntrl-site/color';
import { getItemTopStyle } from '../getItemTopStyle';

type StateParamsGetter = (value: any, anchorSide?: AnchorSide) => string;
type AllKeys<T> = T extends any ? keyof T : never;
type StatePropertyKey = AllKeys<ItemStatesMap[keyof ItemStatesMap]>;

const stateTransformationMap: Record<StatePropertyKey, StateParamsGetter> = {
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
  'blur': (blur: number) => `filter: blur(${blur * 100}vw) !important;`,
  'backdropBlur': (backdropBlur: number) => `backdrop-filter: blur(${backdropBlur * 100}vw) !important;`,
  'color': (color: string) => `color: ${CntrlColor.parse(color).toCss()} !important;`,
  'letterSpacing': (letterSpacing: number) => `letter-spacing: ${letterSpacing * 100}vw !important;`,
  'wordSpacing': (wordSpacing: number) => `word-spacing: ${wordSpacing * 100}vw !important;`
};

const CSSPropertyNameMap: Record<keyof ItemState<ArticleItemType>, string> = {
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

export function getStateStyles<T extends ArticleItemType>(
  values: Array<StatePropertyKey>,
  state?: ItemStatesMap[T],
  anchorSide?: AnchorSide
): string {
  if (!state) return '';

  const stateValues = values.reduce<string[]>((acc, valueName) => {
    // @ts-ignore
    if (valueName in state && state[valueName] !== undefined) {
      // @ts-ignore
      const stateProperties = state[valueName] as StateParams<string | number>;
      const getter = stateTransformationMap[valueName] as StateParamsGetter;
      return [
        ...acc,
        getter(stateProperties.value, anchorSide)
      ];
    }
    return acc;
  }, []);

  if (!stateValues.length) return '';
  // @ts-ignore
  const transitionStr = getTransitions(values, state);
  stateValues.push(`transition: ${transitionStr};`);
  return stateValues.join('\n');
}

export function getTransitions<T extends ArticleItemType>(
  values: Array<StatePropertyKey>,
  state?: ItemStatesMap[T]
): string {
  if (!state) return 'unset';
  const transitionValues = values.reduce<string[]>((acc, valueName) => {
    // @ts-ignore TODO
    if (valueName in state && state[valueName] !== undefined) {
      // @ts-ignore TODO
      const stateProperties = state[valueName] as StateParams<string | number>;
      return [
        ...acc,
        // @ts-ignore
        `${CSSPropertyNameMap[valueName]} ${stateProperties!.duration}ms ${stateProperties!.timing} ${stateProperties!.delay}ms`
      ];
    }
    return acc;
  }, []);
  if (!transitionValues.length) return 'unset';
  return transitionValues.join(', ');
}

// export function getStateTransitions<T extends ArticleItemType>(
//
// )
