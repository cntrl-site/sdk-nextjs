import { AnchorSide, ArticleItemType, ItemStatesMap } from '@cntrl-site/sdk';
import { getStateStyles } from './StateStyles/StateStyles';

type AllKeys<T> = T extends any ? keyof T : never;
type StatePropertyKey = AllKeys<ItemStatesMap[keyof ItemStatesMap]>;

export function getStatesCSS<T extends ArticleItemType>(
  itemId: string,
  classNamePrefix: string,
  keys: Array<StatePropertyKey>,
  states: Record<string, ItemStatesMap[T]> | undefined,
  anchorSide?: AnchorSide
) {
  return states
    ? Object.entries(states).map(([stateId, params]) => {
      return `
      .${classNamePrefix}-${itemId}-state-${stateId} {
        ${getStateStyles(keys, params, anchorSide)};
      }
    `;
    }).join('\n')
    : '';
}

