import { ComponentType, FC, useContext, useEffect, useState } from 'react';
import {
  getLayoutStyles,
  ArticleItemType,
  ArticleItemSizingType as SizingType,
  TArticleItemAny,
  TLayout
} from '@cntrl-site/sdk';
import { RectangleItem } from './items/RectangleItem';
import { ImageItem } from './items/ImageItem';
import { VideoItem } from './items/VideoItem';
import { RichTextItem } from './items/RichTextItem';
import { CntrlOverrideContext } from './CntrlOverrideContext';

export interface ItemProps<I extends TArticleItemAny> {
  layouts: TLayout[];
  item: I;
  articleId: string;
}

const itemsMap: Record<ArticleItemType, ComponentType<ItemProps<any>>> = {
  [ArticleItemType.Rectangle]: RectangleItem,
  [ArticleItemType.Image]: ImageItem,
  [ArticleItemType.Video]: VideoItem,
  [ArticleItemType.RichText]: RichTextItem
};

const noop = () => null;

export const Item: FC<ItemProps<TArticleItemAny>> = ({ articleId, item, layouts }) => {
  const overrideRegistry = useContext(CntrlOverrideContext);
  const [, setIsOverridden] = useState<boolean>(false);
  const layoutValues: Record<string, any>[] = [item.area];
  const itemId = item.id;

  useEffect(() => overrideRegistry.onChange(() => {
    setIsOverridden(overrideRegistry.isItemOverridden(articleId, itemId));
  }), [overrideRegistry, articleId, itemId]);

  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizingAxis = parseSizing(item.commonParams.sizing);
  const ItemComponent = overrideRegistry.getItemOverride(articleId, itemId) ?? itemsMap[item.type] ?? noop;

  return (
    <div className={`item-${item.id}`}>
      <ItemComponent articleId={articleId} item={item} layouts={layouts} />
      <style jsx>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => (`
           .item-${item.id} {
              position: absolute;
              top: ${area.top * 100}vw;
              left: ${layoutParams?.fullwidth ? 0 : area.left * 100}vw;
              width: ${layoutParams?.fullwidth ? '100vw' : sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'auto'};
              height: ${sizingAxis.y === SizingType.Manual ? `${area.height * 100}vw` : 'auto'};
              z-index: ${area.zIndex};
              transform: rotate(${area.angle}deg);
            }
        `))}
      `}</style>
    </div>
  );
};

const parseSizing = (sizing: string): Axis => {
  const axisSizing = sizing.split(' ');
  return {
    y: axisSizing[0],
    x: axisSizing[1] ? axisSizing[1] : axisSizing[0]
  } as Axis;
};

interface Axis {
  x: SizingType;
  y: SizingType;
}
