import { createContext, FC, PropsWithChildren, useState } from 'react';
import { Interaction, InteractionTrigger } from '@cntrl-site/sdk';

const defaultState = {
  interactionsStatesMap: {},
  interactions: [],
  transitionTo: () => {},
  getItemTrigger: () => null
};

export const InteractionsContextOld = createContext<{
  interactionsStatesMap: StatesMap,
  interactions: Interaction[],
  transitionTo: (interactionId: string, stateId: string) => void,
  getItemTrigger: (itemId: string, triggerType: TriggerType) => Trigger | null
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
  const getItemTrigger = (itemId: string, triggerType: TriggerType): Trigger | null => {
    for (const interaction of interactions) {
      const activeStateId = interactionsStatesMap[interaction.id];
      const matchingTrigger = interaction.triggers.find((trigger) =>
        trigger.itemId === itemId &&
        trigger.from === activeStateId &&
        trigger.type === triggerType
      );
      if (matchingTrigger) {
        return {
          id: interaction.id,
          from: matchingTrigger.from,
          to: matchingTrigger.to,
        };
      }
    }
    return null;
  };
  return (
    <InteractionsContextOld.Provider value={{
      transitionTo,
      interactionsStatesMap,
      interactions,
      getItemTrigger
    }}>
      {children}
    </InteractionsContextOld.Provider>
  );
};

type StatesMap = Record<InteractionId, StateId>;
type Trigger = { id: InteractionId, from: StateId, to: StateId };
type TriggerType = InteractionTrigger['type'];
type InteractionId = string;
type StateId = string;
