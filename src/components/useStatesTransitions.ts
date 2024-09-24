import { ArticleItemType, ItemState, ItemStateParams, StateParams, ItemStatesMap } from '@cntrl-site/sdk';
import { useContext, useEffect, useMemo } from 'react';
import { InteractionsContext } from '../provider/InteractionsContext';
import { useCurrentLayout } from '../common/useCurrentLayout';

type AllKeys<T> = T extends any ? keyof T : never;
type StatePropertyKey = AllKeys<ItemStatesMap[keyof ItemStatesMap]>;
type StateValue<K extends StatePropertyKey> = {
  [T in ArticleItemType]: K extends keyof ItemStatesMap[T]
    ? ItemStatesMap[T][K] extends StateParams<infer V> | undefined
      ? V
      : never
    : never;
}[ArticleItemType];
type TransitionData<K extends StatePropertyKey> = {
  values: Partial<Record<K, StateValue<K>>>;
  transition?: string;
};

export function useStatesTransitions<K extends StatePropertyKey>(
  el: HTMLElement | null,
  state: ItemState<ArticleItemType>,
  styleKeys: K[]
): TransitionData<K> {
  const emptyData = styleKeys.reduce<TransitionData<K>>((map, key) => {
    // @ts-ignore
    map[key] = undefined;
    return map;
  }, {} as TransitionData<K>);
  const outData: TransitionData<K> = useMemo(() => ({
    values: {},
    transition: ''
  }), [state, styleKeys]);
  const { interactionsStatesMap } = useContext(InteractionsContext);
  const { layoutId } = useCurrentLayout();
  const activeStates = Object.values(interactionsStatesMap);
  const statesForLayout = useMemo(() => layoutId ? state[layoutId] : {}, [state, layoutId]);
  const itemStatesIds = statesForLayout ? Object.keys(statesForLayout) : [];
  const itemActiveStateId = activeStates.find((stateId) => itemStatesIds.includes(stateId));
  const itemState = itemActiveStateId ? statesForLayout[itemActiveStateId] : undefined;
  if (!itemState) return emptyData;
  const inTransitionStr = getTransition(itemState, 'in', styleKeys);

  return {
    values: styleKeys.reduce((map, styleKey) => {
      // @ts-ignore
      const prop = itemState[styleKey];
      if (!prop) return map;
      map[styleKey] = prop?.value;
      return map;
    }, {} as TransitionData<K>['values']),
    transition: inTransitionStr
  };
}

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

function getTransition(
  state: ItemStateParams,
  direction: 'in' | 'out',
  values: string[]
) {
  return Object.entries(state)
    .filter(([key]) => values.includes(key))
    .map(([key, params]) => {
      const cssKey = CSSPropertyNameMap[key];
      if (!cssKey) {
        throw new Error(`Cannot translate "${key}" to a CSS property.`);
      }
      return `${cssKey} ${params[direction].duration}ms ${params[direction].timing} ${params[direction].delay}ms`;
    }, [])
    .join(', ');
}

function getSlowestProperty(state: ItemStateParams, direction: 'in' | 'out', values: string[]): string {
  const mappedEntries = Object.entries(state)
    .filter(([key]) => values.includes(key))
    .map(([key, params]) => {
      const transitionParams = params[direction];
      return {
        key,
        time: transitionParams.duration + transitionParams.delay
      }
    });
  if (mappedEntries.length === 0) return '';
  const { key } = mappedEntries.reduce((slowest, current) => current.time > slowest.time ? current : slowest);
  return CSSPropertyNameMap[key];
}
