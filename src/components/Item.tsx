import { ComponentType, FC, useEffect, useRef, useState } from 'react';
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
import { getItemTopStyle, useItemSticky } from './items/useItemSticky';
import { castObject } from '../utils/castObject';

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
  const position = useItemPosition(item);
  const ref = useRef<HTMLDivElement | null>(null);
  const [parentOffsetTop, setParentOffsetTop] = useState(0);
  const { top, isFixed } = useItemSticky(position.top, parentOffsetTop, item);
  const { width, height } = useItemDimensions(item);
  const layoutValues: Record<string, any>[] = [item.area];
  const isInitialRef = useRef(true);
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizingAxis = parseSizing(item.commonParams.sizing);
  const ItemComponent = itemsMap[item.type] || noop;

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const offsetParent = castObject(ref.current.offsetParent, HTMLElement);
    setParentOffsetTop(offsetParent.offsetTop / window.innerWidth);
  }, []);

  const styles = {
    transform: `rotate(${angle}deg)`,
    left: `${position.left * 100}vw`,
    width: `${sizingAxis.x === SizingType.Manual ? `${width * 100}vw` : 'max-content'}`,
    height: `${sizingAxis.y === SizingType.Manual ? `${height * 100}vw` : 'unset'}`,
    top
  };

  return (
    <div
      suppressHydrationWarning={true}
      className={`item-${item.id}`}
      ref={ref}
      style={isInitialRef.current ? {} : { ...styles, position: isFixed ? 'fixed': 'absolute' } }
    >
      <ItemComponent item={item} />
      <style jsx>{`
        ${getLayoutStyles(layouts, layoutValues, ([area]) => (`
           .item-${item.id} {
              position: absolute;
              z-index: ${area.zIndex};
              top: ${getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
              width: ${sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'max-content'};
              height: ${sizingAxis.y === SizingType.Manual ? `${area.height * 100}vw` : 'unset'};
              z-index: ${area.zIndex};
              transform: rotate(${area.angle}deg);
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
