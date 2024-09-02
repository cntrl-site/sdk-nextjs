import { ItemStateParams } from '@cntrl-site/sdk';
import { useContext } from 'react';
import { InteractionsContext } from '../provider/InteractionsContext';
import { useCurrentLayout } from '../common/useCurrentLayout';

export function useStatesClassNames(
  itemId: string,
  itemStates: Record<LayoutId, Record<StateId, ItemStateParams>>,
  uniquePrefix: string, // unique in terms of item type, ie. rectangle, code-embed, group etc
): string {
  const { interactionsStatesMap } = useContext(InteractionsContext);
  const { layoutId } = useCurrentLayout();
  const activeStates = Object.values(interactionsStatesMap);
  const statesForLayout = layoutId ? itemStates[layoutId] : {};
  const stateClassNames = Object.keys(statesForLayout ?? {})
    .filter((stateId) => activeStates.includes(stateId))
    .map((stateId) => `${uniquePrefix}-${itemId}-state-${stateId}`)
    .join(' ');
  return stateClassNames;
}

type StateId = string;
type LayoutId = string;
