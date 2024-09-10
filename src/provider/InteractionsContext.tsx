import { createContext, FC, PropsWithChildren, useState } from 'react';
import { Interaction, InteractionTrigger } from '@cntrl-site/sdk';

const defaultState = {
  interactionsStatesMap: {},
  interactions: [],
  transitionTo: () => {},
  getItemTrigger: () => null
};

export const InteractionsContext = createContext<{
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
  // TODO need to handle trigger OUT from many states, example:
  //  1. two interactions with the same state
  //  2. one "click" trigger to quit all
  //  3. need to send many transitions instead of one
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
    <InteractionsContext.Provider value={{
      transitionTo,
      interactionsStatesMap,
      interactions,
      getItemTrigger
    }}>
      {children}
    </InteractionsContext.Provider>
  );
};

type StatesMap = Record<InteractionId, StateId>;
type Trigger = { id: InteractionId, from: StateId, to: StateId };
type TriggerType = InteractionTrigger['type'];
type InteractionId = string;
type StateId = string;
