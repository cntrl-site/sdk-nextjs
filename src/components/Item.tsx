import { ComponentType, FC, useEffect, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  ArticleItemSizingType as SizingType,
  ArticleItemType,
  getLayoutStyles,
  TArticleItem,
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
import { useItemPosition } from './useItemPosition';
import { useItemDimensions } from './useItemDimensions';
import { getItemTopStyle, useItemSticky } from './items/useItemSticky';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { useItemScale } from './useItemScale';
import { ScaleAnchorMap } from '../utils/ScaleAnchorMap';

export interface ItemProps<I extends TArticleItemAny> {
  item: I;
  sectionId: string;
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

export const Item: FC<ItemProps<TArticleItemAny>> = ({ item, sectionId}) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { scale, scaleAnchor } = useItemScale(item, sectionId);
  const position = useItemPosition(item, sectionId);
  const layout = useCurrentLayout();
  const { top, isFixed } = useItemSticky(position.top, item, sectionId);
  const { width, height } = useItemDimensions(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area];
  const isInitialRef = useRef(true);
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizing = isItemType(item, ArticleItemType.RichText)
    ? item.layoutParams[layout].sizing
    : undefined;
  const sizingAxis = parseSizing(sizing);
  const ItemComponent = itemsMap[item.type] || noop;

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const styles = {
    transform: `scale(${scale})`,
    transformOrigin: ScaleAnchorMap[scaleAnchor],
    left: `${position.left * 100}vw`,
    width: `${sizingAxis.x === SizingType.Manual ? `${width * 100}vw` : 'max-content'}`,
    height: `${sizingAxis.y === SizingType.Manual ? `${height * 100}vw` : 'unset'}`,
    top
  };

  return (
    <div
      suppressHydrationWarning={true}
      className={`item-${item.id}`}
      style={isInitialRef.current ? {} : { ...styles, position: isFixed ? 'fixed': 'absolute' } }
    >
      <ItemComponent item={item} sectionId={sectionId} />
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          const sizingAxis = parseSizing(layoutParams.sizing);
          return (`
           .item-${item.id} {
              position: absolute;
              z-index: ${area.zIndex};
              top: ${getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
              width: ${sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'max-content'};
              height: ${sizingAxis.y === SizingType.Manual ? `${area.height * 100}vw` : 'unset'};
              z-index: ${area.zIndex};
              transform: scale(${scale});
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
            }
          `);
        })}
      `}</JSXStyle>
    </div>
  );
};

function parseSizing(sizing: string = 'manual'): Axis {
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

export function isItemType<T extends ArticleItemType>(item: TArticleItemAny, itemType: T): item is TArticleItem<T> {
  return item.type === itemType;
}
