import { ComponentType, FC } from 'react';
import {
  getLayoutStyles,
  ArticleItemType,
  ArticleItemSizingType as SizingType,
  TArticleItemAny
} from '@cntrl-site/sdk';
import { RectangleItem } from './items/RectangleItem';
import { ImageItem } from './items/ImageItem';
import { VideoItem } from './items/VideoItem';
import { RichTextItem } from './items/RichTextItem';
import { VimeoEmbedItem } from './items/VimeoEmbed';
import { YoutubeEmbedItem } from './items/YoutubeEmbed';
import { CustomItem } from './items/CustomItem';
import { useCntrlContext } from '../provider/useCntrlContext';
import { useItemAngle } from './useItemAngle';
import { useItemPosition } from './useItemPosition';
import { useItemDimensions } from './useItemDimensions';

export interface ItemProps<I extends TArticleItemAny> {
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

export const Item: FC<ItemProps<TArticleItemAny>> = ({ item }) => {
  const { layouts } = useCntrlContext();
  const angle = useItemAngle(item);
  const { top, left } = useItemPosition(item);
  const { width, height } = useItemDimensions(item);
  const layoutValues: Record<string, any>[] = [item.area];
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizingAxis = parseSizing(item.commonParams.sizing);
  const ItemComponent = itemsMap[item.type] || noop;

  return (
    <div
      suppressHydrationWarning={true}
      className={`item-${item.id}`}
      style={{
        transform: `rotate(${angle}deg)`,
        left: `${left * 100}vw`,
        width: `${sizingAxis.x === SizingType.Manual ? `${width * 100}vw` : 'max-content'}`,
        height: `${sizingAxis.y === SizingType.Manual ? `${height * 100}vw` : 'unset'}`,
        top
      }}
    >
      <ItemComponent item={item} />
      <style jsx>{`
        ${getLayoutStyles(layouts, layoutValues, ([area]) => (`
           .item-${item.id} {
              position: absolute;
              z-index: ${area.zIndex};
            }
        `))}
      `}</style>
    </div>
  );
};

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
