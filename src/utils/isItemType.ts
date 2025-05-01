import { ArticleItemType, ItemAny, Item as TItem } from '@cntrl-site/sdk';

export function isItemType<T extends ArticleItemType>(item: ItemAny, itemType: T): item is TItem<T> {
  return item.type === itemType;
}
