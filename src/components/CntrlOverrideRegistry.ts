import { FC } from 'react';
import { ItemProps } from './Item';

export type RenderOverride = FC<ItemProps<any>>;
type ChangeListener = () => void;

export class CntrlOverrideRegistry {
  private itemRegistry: Map<string, RenderOverride> = new Map();
  private changeListeners: ChangeListener[] = [];

  public overrideItem(articleId: string, itemId: string, renderOverride: RenderOverride): () => void {
    const key = this.getItemKey(articleId, itemId);
    this.itemRegistry.set(key, renderOverride);
    this.notifyChange();
    return () => {
      this.itemRegistry.delete(key);
    };
  }

  public getItemOverride(articleId: string, itemId: string): RenderOverride | undefined {
    return this.itemRegistry.get(this.getItemKey(articleId, itemId));
  }

  public isItemOverridden(articleId: string, itemId: string): boolean {
    return this.itemRegistry.has(this.getItemKey(articleId, itemId));
  }

  public onChange(listener: ChangeListener): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter(l => l !== listener);
    };
  }

  private getItemKey(articleId: string, itemId: string): string {
    const key = `${articleId}/${itemId}`;
    return key;
  }

  private notifyChange() {
    for (const listener of this.changeListeners) {
      try {
        listener();
      } catch (error) {
        // supress error
      }
    }
  }
}
