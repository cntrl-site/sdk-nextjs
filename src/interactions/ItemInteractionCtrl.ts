import { InteractionsRegistryPort, ItemInteractionCtrl } from './types';
import { getTransition } from './getTransition';
import { getStyleKeysFromCSSProperty } from './CSSPropertyNameMap';

export class ItemInteractionController implements ItemInteractionCtrl {
  private transitionsInProgress: Set<string> = new Set();
  constructor(
    private itemId: string,
    private registry: InteractionsRegistryPort,
    private onChange: () => void
  ) {
    this.registry.register(itemId, this);
  }

  getState(keys: string[]) {
    const stateProps = this.registry.getStatePropsForItem(this.itemId);
    const styles = keys.reduce<Record<string, string | number>>((map, styleKey) => {
      const prop = stateProps[styleKey];
      if (prop?.value === undefined) return map;
      map[styleKey] = prop.value;
      return map;
    }, {});
    const transition = getTransition(stateProps, keys);
    return {
      styles,
      transition
    };
  }

  sendTrigger(type: 'click' | 'hover-in' | 'hover-out') {
    this.registry.notifyTrigger(this.itemId, type);
  }

  handleTransitionStart = (types: string[]) => {
    this.transitionsInProgress.clear();
    for (const type of types) {
      this.transitionsInProgress.add(type);
    }
  };

  handleTransitionEnd = (cssPropKey: string) => {
    const styleKeys = getStyleKeysFromCSSProperty(cssPropKey);
    for (const key of styleKeys) {
      const found = this.transitionsInProgress.has(key);
      if (!found) continue;
      this.transitionsInProgress.delete(key);
      break;
    }
    if (this.transitionsInProgress.size !== 0) return;
    this.registry.notifyTransitionEnd(this.itemId);
  };

  receiveChange() {
    this.onChange();
  }
}
