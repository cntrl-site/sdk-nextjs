import { ComponentType, FC } from 'react';
import {
  getLayoutStyles,
  ArticleItemType,
  ArticleItemSizingType as SizingType,
  TArticleItemAny,
  TLayout,
  AnchorSide
} from '@cntrl-site/sdk';
import { RectangleItem } from './items/RectangleItem';
import { ImageItem } from './items/ImageItem';
import { VideoItem } from './items/VideoItem';
import { RichTextItem } from './items/RichTextItem';
import { VimeoEmbedItem } from './items/VimeoEmbed';
import { YoutubeEmbedItem } from './items/YoutubeEmbed';
import { CustomItem } from './items/CustomItem';

export interface ItemProps<I extends TArticleItemAny> {
  layouts: TLayout[];
  item: I;
}

const itemsMap: Record<ArticleItemType, ComponentType<ItemProps<any>>> = {
  [ArticleItemType.Rectangle]: RectangleItem,
  [ArticleItemType.Image]: ImageItem,
  [ArticleItemType.Video]: VideoItem,
  [ArticleItemType.RichText]: RichTextItem,
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedItem,
  [ArticleItemType.VimeoEmbed]: VimeoEmbedItem,
  [ArticleItemType.Custom]: CustomItem
};

const noop = () => null;

export const Item: FC<ItemProps<TArticleItemAny>> = ({ item, layouts }) => {
  const layoutValues: Record<string, any>[] = [item.area];
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizingAxis = parseSizing(item.commonParams.sizing);
  const ItemComponent = itemsMap[item.type] || noop;

  return (
    <div className={`item-${item.id}`}>
      <ItemComponent item={item} layouts={layouts} />
      <style jsx>{`
        ${getLayoutStyles(layouts, layoutValues, ([area]) => (`
           .item-${item.id} {
              position: absolute;
              top: ${getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
              width: ${sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'auto'};
              height: ${sizingAxis.y === SizingType.Manual ? `${area.height * 100}vw` : 'auto'};
              z-index: ${area.zIndex};
              transform: rotate(${area.angle}deg);
            }
        `))}
      `}</style>
    </div>
  );
};

function getItemTopStyle(top: number, anchorSide: AnchorSide) {
  const defaultValue = `${top * 100}vw`;
  if (!anchorSide) return defaultValue;
  switch (anchorSide) {
    case AnchorSide.Top:
      return defaultValue;
    case AnchorSide.Center:
      return `calc(50% + ${top * 100}vw)`;
    case AnchorSide.Bottom:
      return `calc(100% + ${top * 100}vw)`;
  }
}

function parseSizing(sizing: string): Axis {
  const axisSizing = sizing.split(' ');
  return {
    y: axisSizing[0],
    x: axisSizing[1] ? axisSizing[1] : axisSizing[0]
  } as Axis;
}

interface Axis {
  x: SizingType;
  y: SizingType;
}
