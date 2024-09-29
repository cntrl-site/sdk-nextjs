import { InteractionsRegistryPort, ItemInteractionCtrl } from './types';
import {
  Article,
  ArticleItemType,
  Interaction,
  InteractionTrigger,
  ItemAny,
  ItemState,
  StateParams
} from '@cntrl-site/sdk';

export class InteractionsRegistry implements InteractionsRegistryPort {
  private ctrls: Map<ItemId, ItemInteractionCtrl> = new Map();
  private items: ItemAny[];
  private interactions: Interaction[];
  private stateItemsIdsMap: StateItemsIdsMap;
  private interactionStateMap: InteractionStateMap;
  private itemStageMap: ItemStageMap;

  constructor(article: Article, private layoutId: string) {
    const { interactions } = article;
    const items = article.sections.flatMap((section) => section.items);
    const activeStatesIds = interactions.reduce<StateId[]>((map, inter) => {
      const activeStateId = inter.states.find((state) => state.id !== inter.startStateId)?.id!;
      map.push(activeStateId);
      return map;
    }, []);
    const interactionStateMap = interactions.reduce<InteractionStateMap>((map, { id, startStateId }) => {
      map[id] = startStateId;
      return map;
    }, {});
    const itemStageMap = items.reduce<ItemStageMap>((map, item) => {
      map[item.id] = { type: 'active', isStartState: true };
      return map;
    }, {});
    const stateItemsIdsMap = activeStatesIds.reduce<StateItemsIdsMap>((map, stateId) => {
      map[stateId] = items
        .filter((item) => {
          const layoutStates = item.state[layoutId] ?? {};
          const state = layoutStates?.[stateId] ?? {};
          const hasKeys = Object.keys(state).length !== 0;
          return hasKeys;
        })
        .map((item) => item.id);
      return map;
    }, {});
    this.items = items;
    this.interactions = interactions;
    this.itemStageMap = itemStageMap;
    this.stateItemsIdsMap = stateItemsIdsMap;
    this.interactionStateMap = interactionStateMap;
  }

  register(itemId: ItemId, ctrl: ItemInteractionCtrl) {
    this.ctrls.set(itemId, ctrl);
  }

  getStatePropsForItem(itemId: string) {
    const { items, layoutId } = this;
    const item = items.find((item) => item.id === itemId)!;
    const stage = this.itemStageMap[itemId];
    if (!stage) return {};
    // handle "active" stage
    if (stage.type === 'active') {
      if (stage.isStartState) return {};
      const params = item.state[layoutId]?.[stage.stateId!];
      const stateProps = Object.entries(params).reduce<StateProps>((map, [key, stateDetails]) => {
        const style = key as keyof ItemState<ArticleItemType>;
        map[style] = {
          value: stateDetails.value
        };
        return map;
      }, {});
      return stateProps;
    }
    // handle "transitioning" stage
    const activeStateId = stage.direction === 'in' ? stage.to : stage.from;
    const params = item.state[layoutId]?.[activeStateId];
    return Object.entries(params).reduce<StateProps>((map, [key, stateDetails]) => {
      const style = key as keyof ItemState<ArticleItemType>;
      const details = stateDetails as StateParams<string | number>;
      map[style] = {
        value: stage.direction === 'in' ? details.value : undefined,
        transition: {
          timing: details[stage.direction].timing,
          duration: details[stage.direction].duration,
          delay: details[stage.direction].delay
        }
      };
      return map;
    }, {});
  }

  notifyTrigger(itemId: string, triggerType: TriggerType): void {
    for (const interaction of this.interactions) {
      const currentStateId = this.getCurrentStateByInteractionId(interaction.id);
      const matchingTrigger = interaction.triggers.find((trigger) =>
        trigger.itemId === itemId
        && trigger.from === currentStateId
        && trigger.type === triggerType
      );
      if (!matchingTrigger) continue;
      const activeStateId = this.getActiveInteractionState(interaction.id);
      const isNewStateActive = matchingTrigger.to === activeStateId;
      this.setCurrentStateForInteraction(interaction.id, matchingTrigger.to);
      const transitioningItems = this.stateItemsIdsMap[activeStateId] ?? [];
      for (const [itemId, stage] of Object.entries(this.itemStageMap)) {
        if (!transitioningItems.includes(itemId)) continue;
        this.itemStageMap[itemId] = {
          type: 'transitioning',
          from: stage.type === 'transitioning' ? stage.to : stage.stateId!,
          to: matchingTrigger.to,
          direction: isNewStateActive ? 'in' : 'out'
        };
      }
      this.notifyItemCtrlsChange(transitioningItems);
      this.notifyTransitionStartForItems(transitioningItems, activeStateId);
    }
  }

  notifyTransitionStartForItems(itemsIds: string[], activeStateId: string) {
    for (const itemId of itemsIds) {
      const ctrl = this.ctrls.get(itemId);
      const item = this.items.find((item) => item.id === itemId)!;
      const keys = Object.keys(item.state[this.layoutId]?.[activeStateId] ?? {});
      ctrl?.handleTransitionStart?.(keys);
    }
  }

  notifyTransitionEnd(itemId: string): void {
    const prevState = this.itemStageMap[itemId];
    if (prevState.type !== 'transitioning') return; // throw?
    this.itemStageMap[itemId] = {
      type: 'active',
      stateId: prevState.to,
      isStartState: prevState.direction === 'out'
    };
    this.ctrls.get(itemId)?.receiveChange();
  }


  private getCurrentStateByInteractionId(id: InteractionId): string {
    let state;
    for (const interactionId of Object.keys(this.interactionStateMap)) {
      if (id !== interactionId) continue;
      state = this.interactionStateMap[interactionId];
    }
    if (!state) throw new Error(`Failed to find current state for interaction w/ id="${id}"`);
    return state;
  }

  private setCurrentStateForInteraction(interactionId: InteractionId, stateId: StateId) {
    this.interactionStateMap = {
      ...this.interactionStateMap,
      [interactionId]: stateId
    };
  }

  private getActiveInteractionState(interactionId: InteractionId): string {
    const { interactions } = this;
    const interaction = interactions.find((interaction) => interaction.id === interactionId)!;
    return interaction.states.find(state => state.id !== interaction.startStateId)?.id!;
  }

  private notifyItemCtrlsChange(itemsIds: string[]) {
    for (const itemId of itemsIds) {
      this.ctrls.get(itemId)?.receiveChange();
    }
  }
}

type ItemStageMap = Record<ItemId, TransitioningStage | ActiveStage>;
type TransitioningStage = {
  type: 'transitioning';
  from: StateId;
  to: StateId;
  direction: 'in' | 'out';
};
type ActiveStage = { type: 'active'; stateId?: string; isStartState: boolean; };
type InteractionStateMap = Record<InteractionId, StateId>;
type StateItemsIdsMap = Record<StateId, ItemId[]>;
type TriggerType = InteractionTrigger['type'];
type InteractionId = string;
type StateId = string;
type ItemId = string;
type StateProps = Record<string, {
  value?: string | number;
  transition?: {
    timing: string;
    duration: number;
    delay: number;
  };
}>;
