import { ComponentType, FC, useEffect, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  AnchorSide,
  ArticleItemSizingType as SizingType,
  ArticleItemType,
  getLayoutStyles,
  TArticleItem,
  TStickyParams,
  TArticleItemAny,

} from '@cntrl-site/sdk';
import { RectangleItem } from './items/RectangleItem';
import { ImageItem } from './items/ImageItem';
import { VideoItem } from './items/VideoItem';
import { RichTextItem } from './items/RichTextItem';
import { VimeoEmbedItem } from './items/VimeoEmbed';
import { YoutubeEmbedItem } from './items/YoutubeEmbed';
import { CustomItem } from './items/CustomItem';
import { useCntrlContext } from '../provider/useCntrlContext';
import { getItemTopStyle, useItemPosition } from './useItemPosition';
import { useItemDimensions } from './useItemDimensions';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { useItemScale } from './useItemScale';
import { ScaleAnchorMap } from '../utils/ScaleAnchorMap';
import { useSectionHeightData } from './useSectionHeightMap';

export interface ItemProps<I extends TArticleItemAny> {
  item: I;
  sectionId: string;
  onResize?: (height: number) => void;
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
  const [wrapperHeight, setWrapperHeight] = useState<undefined | number>(undefined);
  const { scale, scaleAnchor } = useItemScale(item, sectionId);
  const { top, left } = useItemPosition(item, sectionId);
  const sectionHeight = useSectionHeightData(sectionId);
  const layout = useCurrentLayout();
  const { width, height } = useItemDimensions(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area];
  const isInitialRef = useRef(true);
  layoutValues.push(item.sticky);
  layoutValues.push(sectionHeight);
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizing = isItemType(item, ArticleItemType.RichText)
    ? item.layoutParams[layout].sizing
    : undefined;
  const sizingAxis = parseSizing(sizing);
  const ItemComponent = itemsMap[item.type] || noop;

  const handleItemResize = (height: number) => {
    const sticky = item.sticky[layout];
    if (!sticky) {
      setWrapperHeight(undefined);
      return;
    }
    const wrapperHeight = getStickyItemWrapperHeight(sticky, height)
    setWrapperHeight(wrapperHeight);
  };

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const styles = {
    transform: `scale(${scale})`,
    transformOrigin: ScaleAnchorMap[scaleAnchor],
    width: `${sizingAxis.x === SizingType.Manual ? `${width * 100}vw` : 'max-content'}`,
    height: `${sizingAxis.y === SizingType.Manual ? `${height * 100}vw` : 'unset'}`,
  };

  return (
    <div className={`item-wrapper-${item.id}`}
      style={{ top, left, ...(wrapperHeight ? { height: `${wrapperHeight * 100}vw` } : {}) }}
    >
      <div
        suppressHydrationWarning={true}
        className={`item-${item.id}`}
        style={isInitialRef.current ? {} : styles }
      >
        <ItemComponent item={item} sectionId={sectionId} onResize={handleItemResize} />
      </div>
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, sticky, sectionHeight, layoutParams]) => {
        const sizingAxis = parseSizing(layoutParams.sizing);
        return (`
           .item-${item.id} {
              position: ${sticky ? 'sticky' : 'absolute'};
              width: ${sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'max-content'};
              height: ${sizingAxis.y === SizingType.Manual ? `w${area.height * 100}vw` : 'unset'};
              transform: scale(${scale});
              top: ${sticky ? `${getAnchoredItemTop(area.top - sticky.from, sectionHeight, area.anchorSide)}`  : 0};
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
              pointer-events: auto;
              --webkit-backface-visibility: hidden;
            }
            .item-wrapper-${item.id} {
              position: absolute;
              z-index: ${area.zIndex};
              -webkit-transform: translate3d(0, 0, 0);
              transform: translate3d(0, 0, 0);
              pointer-events: none;
              top: ${getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
              height: ${sticky ? `${getStickyItemWrapperHeight(sticky, area.height) * 100}vw` : 'unset'};
            }
          `);
      })}
      `}</JSXStyle>
    </div>
  );
};

function getAnchoredItemTop(top: number, sectionHeight: string, anchorSide: AnchorSide) {
  const styleTop = `${top * 100}vw`;
  switch (anchorSide) {
    case AnchorSide.Center: return `calc(${styleTop} + ${sectionHeight} / 2)`;
    case AnchorSide.Bottom: return `calc(${styleTop} + ${sectionHeight})`;
    case AnchorSide.Top:
    default:
      return styleTop;
  }
}

function getStickyItemWrapperHeight(sticky: TStickyParams, itemHeight: number): number {
  const end = sticky.to ?? 100;
  return end - sticky.from + itemHeight;
}

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
