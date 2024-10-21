import { ArticleItemType, ItemAny } from '@cntrl-site/sdk';
import { Item as TItem } from '@cntrl-site/sdk/src/types/article/Item';

export function isItemType<T extends ArticleItemType>(item: ItemAny, itemType: T): item is TItem<T> {
  return item.type === itemType;
}
