import { createContext, FC, PropsWithChildren, useMemo, useState } from 'react';
import { Interaction } from '@cntrl-site/sdk';

const defaultState = {
  interactionsStatesMap: {},
  transitionTo: () => {}
};

export const InteractionsContext = createContext<{
  interactionsStatesMap: StatesMap,
  transitionTo: (interactionId: string, stateId: string) => void
}>(defaultState);

interface Props {
  interactions: Interaction[];
}

export const InteractionsProvider: FC<PropsWithChildren<Props>> = ({ interactions, children }) => {
  const defaultStatesMap = interactions.reduce<Record<string, string>>((map, { id, startStateId }) => {
    map[id] = startStateId;
    return map;
  }, {});
  const [interactionsStatesMap, setInteractionsStatesMap] = useState(defaultStatesMap);
  const transitionTo = (interactionId: string, stateId: string) => {
    setInteractionsStatesMap((map) => ({ ...map, [interactionId]: stateId }));
  };
  return (
    <InteractionsContext.Provider value={{ interactionsStatesMap, transitionTo }}>
      {children}
    </InteractionsContext.Provider>
  );
};

type StatesMap = Record<InteractionId, StateId>;
type InteractionId = string;
type StateId = string;
