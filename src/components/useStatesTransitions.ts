import { ArticleItemType, ItemState, ItemStateParams, ItemStatesMap } from '@cntrl-site/sdk';
import { useContext, useEffect, useMemo } from 'react';
import { InteractionsContext } from '../provider/InteractionsContext';
import { useCurrentLayout } from '../common/useCurrentLayout';

type AllKeys<T> = T extends any ? keyof T : never;
type StatePropertyKey = AllKeys<ItemStatesMap[keyof ItemStatesMap]>;

export function useStatesTransitions(
  el: HTMLElement | null,
  state: ItemState<ArticleItemType>,
  values: StatePropertyKey[]
) {
  const { interactionsStatesMap } = useContext(InteractionsContext);
  const { layoutId } = useCurrentLayout();
  const activeStates = Object.values(interactionsStatesMap);
  const statesForLayout = useMemo(() => layoutId ? state[layoutId] : {}, [layoutId]);
  const itemStatesIds = Object.keys(statesForLayout);
  const itemActiveStateId = activeStates.find((stateId) => itemStatesIds.includes(stateId));
  useEffect(() => {
    if (!itemActiveStateId || !el) return;
    const state = statesForLayout[itemActiveStateId];
    const transitionStr = getTransition(state, 'in', values);
    const slowestProp = getSlowestProperty(state, 'in', values);
    if (!transitionStr) return;
    el.style.transition = transitionStr;
    el.ontransitionend = (e) => {
      e.stopPropagation();
      if (e.target !== el || e.propertyName !== slowestProp) return;
      el.style.transition = 'none';
    };
    return () => {
      const transitionStr = getTransition(state, 'out', values);
      const slowestProp = getSlowestProperty(state, 'out', values);
      if (!transitionStr) return;
      el.style.transition = transitionStr;
      el.ontransitionend = (e) => {
        e.stopPropagation();
        if (e.target !== el || e.propertyName !== slowestProp) return;
        el.style.transition = 'none';
      };
    };
  }, [itemActiveStateId, statesForLayout, el]);
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
