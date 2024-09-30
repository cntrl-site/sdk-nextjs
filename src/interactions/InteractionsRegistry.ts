import { InteractionsRegistryPort, ItemInteractionCtrl } from './types';
import {
  Article,
  ArticleItemType,
  Interaction,
  InteractionTrigger,
  ItemAny,
} from '@cntrl-site/sdk';
import { isItemType } from '../components/Item';

export class InteractionsRegistry implements InteractionsRegistryPort {
  private ctrls: Map<ItemId, ItemInteractionCtrl> = new Map();
  private items: ItemAny[];
  private interactions: Interaction[];
  private stateItemsIdsMap: StateItemsIdsMap;
  private interactionStateMap: InteractionStateMap;
  private itemsStages: ItemStages;
  private activeStateIdInteractionIdMap: Record<StateId, InteractionId>;

  constructor(article: Article, private layoutId: string) {
    const { interactions } = article;
    this.items = this.unpackItems(article);
    const activeStatesIds = interactions.reduce<StateId[]>((map, inter) => {
      const activeStateId = inter.states.find((state) => state.id !== inter.startStateId)?.id!;
      map.push(activeStateId);
      return map;
    }, []);
    const interactionStateMap = interactions.reduce<InteractionStateMap>((map, { id, startStateId }) => {
      map[id] = startStateId;
      return map;
    }, {});
    this.activeStateIdInteractionIdMap = interactions.reduce<Record<StateId, InteractionId>>((map, interaction) => {
      const activeState = interaction.states.find((state) => state.id !== interaction.startStateId);
      if (activeState) {
        map[activeState.id] = interaction.id;
      }
      return map;
    }, {});
    const itemStages = this.getDefaultItemStages();
    const stateItemsIdsMap = activeStatesIds.reduce<StateItemsIdsMap>((map, stateId) => {
      map[stateId] = this.items
        .filter((item) => {
          const layoutStates = item.state[layoutId] ?? {};
          const state = layoutStates?.[stateId] ?? {};
          const hasKeys = Object.keys(state).length !== 0;
          return hasKeys;
        })
        .map((item) => item.id);
      return map;
    }, {});
    this.interactions = interactions;
    this.itemsStages = itemStages;
    this.stateItemsIdsMap = stateItemsIdsMap;
    this.interactionStateMap = interactionStateMap;
  }

  register(itemId: ItemId, ctrl: ItemInteractionCtrl) {
    this.ctrls.set(itemId, ctrl);
  }

  getStatePropsForItem(itemId: string) {
    const { items, layoutId } = this;
    const item = items.find((item) => item.id === itemId)!;
    const itemStages = this.itemsStages.filter((stage) => stage.itemId === itemId);
    itemStages.sort((a, b) => a.updated - b.updated);
    const itemStyles: StateProps = {};
    for (const stage of itemStages) {
      if (stage.type === 'active') {
        if (stage.isStartState) continue;
        const params = item.state[layoutId]?.[stage.stateId!] ?? {};
        for (const [key, stateDetails] of Object.entries(params)) {
          itemStyles[key] = {
            value: stateDetails.value
          };
        }
      }
      if (stage.type === 'transitioning') {
        const activeStateId = stage.direction === 'in' ? stage.to : stage.from;
        const params = item.state[layoutId]?.[activeStateId] ?? {};
        for (const [key, stateDetails] of Object.entries(params)) {
          itemStyles[key] = {
            value: stage.direction === 'in' ? stateDetails.value : itemStyles[key]?.value,
            transition: {
              timing: stateDetails[stage.direction].timing,
              duration: stateDetails[stage.direction].duration,
              delay: stateDetails[stage.direction].delay
            }
          };
        }
      }
    }
    return itemStyles;
  }

  notifyTrigger(itemId: string, triggerType: TriggerType): void {
    const timestamp = Date.now();
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
      this.itemsStages = this.itemsStages.map((stage) => {
        if (stage.interactionId !== interaction.id) return stage;
        return {
          itemId: stage.itemId,
          interactionId: stage.interactionId,
          type: 'transitioning',
          from: stage.type === 'transitioning' ? stage.to : stage.stateId!,
          to: matchingTrigger.to,
          direction: isNewStateActive ? 'in' : 'out',
          updated: timestamp
        };
      });
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
    const timestamp = Date.now();
    this.itemsStages = this.itemsStages.map((stage) => {
      if (stage.itemId !== itemId || stage.type !== 'transitioning') return stage;
      return {
        itemId: itemId,
        interactionId: stage.interactionId,
        type: 'active',
        stateId: stage.to,
        isStartState: stage.direction === 'out',
        updated: timestamp
      };
    });
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

  private unpackItems(article: Article): ItemAny[] {
    const itemsArr = [];
    for (const section of article.sections) {
      for (const item of section.items) {
        const { items, ...itemWithoutChildren } = item;
        itemsArr.push(itemWithoutChildren);
        if (!isItemType(item, ArticleItemType.Group)) continue;
        const groupChildren = item?.items ?? [];
        for (const child of groupChildren) {
          itemsArr.push(child);
        }
      }
    }
    return itemsArr;
  }

  private getDefaultItemStages(): ItemStages {
    const timestamp = Date.now();
    const { items, layoutId } = this;
    const stages: ItemStages = [];
    for (const item of items) {
      const itemStatesMap = item.state[layoutId];
      if (!itemStatesMap) continue;
      for (const stateId of Object.keys(itemStatesMap)) {
        const interactionId = this.activeStateIdInteractionIdMap[stateId];
        if (!interactionId) continue;
        stages.push({
          itemId: item.id,
          interactionId,
          type: 'active',
          isStartState: true,
          updated: timestamp
        });
      }
    }
    return stages;
  }
}

type ItemStages = (TransitioningStage | ActiveStage)[];
type TransitioningStage = {
  itemId: string;
  interactionId: string;
  type: 'transitioning';
  from: StateId;
  to: StateId;
  direction: 'in' | 'out';
  updated: number;
};
type ActiveStage = { type: 'active'; itemId: string; interactionId: string; stateId?: string; isStartState: boolean; updated: number; };
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
