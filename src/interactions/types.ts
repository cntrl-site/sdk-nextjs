import { ArticleItemType, ItemState } from '@cntrl-site/sdk';

export interface ItemInteractionCtrl {
  getState(keys: string[]): StateCSSInfo;
  sendTrigger(type: 'click' | 'hover-in' | 'hover-out'): void;
  handleTransitionEnd?: (styleKey: string) => void;
  handleTransitionStart?: (styleKeys: string[]) => void;
  receiveChange: () => void;
}

export interface InteractionsRegistryPort {
  register(itemId: string, ctrl: ItemInteractionCtrl): void;
  getStatePropsForItem(itemId: string): StateProps;
  notifyTrigger(itemId: string, type: TriggerType): void;
  notifyTransitionEnd(itemId: string): void;
}

type StateCSSInfo = {
  styles: Partial<Record<string, string | number>>;
  transition?: string;
};

type StateProps = Record<keyof ItemState<ArticleItemType>, {
  value?: string | number;
  transition?: {
    timing: string;
    duration: number;
    delay: number;
  };
}>;

type TriggerType = 'click' | 'hover-in' | 'hover-out';