import { AnchorSide, ArticleItemType, ItemState } from '@cntrl-site/sdk';
import { getStateStyles } from './StateStyles/StateStyles';

export function getStatesCSS(
  itemId: string,
  classNamePrefix: string,
  keys: Array<keyof ItemState<ArticleItemType>>,
  states: Record<string, ItemState<ArticleItemType>> | undefined,
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

