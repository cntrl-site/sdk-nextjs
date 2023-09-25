import { ComponentType, FC, PropsWithChildren, useEffect, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
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
import { useItemPosition } from './useItemPosition';
import { useItemDimensions } from './useItemDimensions';
import { useItemScale } from './useItemScale';
import { ScaleAnchorMap } from '../utils/ScaleAnchorMap';
import { useSectionHeightData } from './useSectionHeightMap';
import { getHoverStyles, getTransitions } from '../utils/HoverStyles/HoverStyles';
import { getItemTopStyle } from '../utils/getItemTopStyle';
import { useStickyItemTop } from './items/useStickyItemTop';
import { getAnchoredItemTop } from '../utils/getAnchoredItemTop';
import { useLayoutContext } from './useLayoutContext';

export interface ItemProps<I extends TArticleItemAny> {
  item: I;
  sectionId: string;
  onResize?: (height: number) => void;
}

export interface ItemWrapperProps extends ItemProps<TArticleItemAny> {
  articleRatio: number; // height / width
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

interface RTWrapperProps {
  isRichText: boolean;
}

const RichTextWrapper: FC<PropsWithChildren<RTWrapperProps>> = ({ isRichText, children }) => {
  if (!isRichText) return <>{children}</>;
  return (
    <div style={{ transformOrigin: 'top left', transform: 'scale(var(--layout-deviation))' }}>
      {children}
    </div>
  );
};

const noop = () => null;

export const Item: FC<ItemWrapperProps> = ({ item, sectionId, articleRatio }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const exemplary = layouts.find(l => l.id === layout)?.exemplary ?? 1;
  const [wrapperHeight, setWrapperHeight] = useState<undefined | number>(undefined);
  const [itemHeight, setItemHeight] = useState<undefined | number>(undefined);
  const { scale, scaleAnchor } = useItemScale(item, sectionId);
  const { top, left } = useItemPosition(item, sectionId);
  const sectionHeight = useSectionHeightData(sectionId);
  const stickyTop = useStickyItemTop(item, sectionHeight, sectionId);
  const { width, height } = useItemDimensions(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.hidden, item.state.hover];
  const isInitialRef = useRef(true);
  layoutValues.push(item.sticky);
  layoutValues.push(sectionHeight);
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }

  const sizing = layout && isItemType(item, ArticleItemType.RichText)
    ? item.layoutParams[layout].sizing
    : undefined;
  const sizingAxis = parseSizing(sizing);
  const ItemComponent = itemsMap[item.type] || noop;

  const handleItemResize = (height: number) => {
    if (!layout) return;
    const sticky = item.sticky[layout];
    if (!sticky) {
      setWrapperHeight(undefined);
      return;
    }
    const wrapperHeight = getStickyItemWrapperHeight(sticky, height, articleRatio);
    setItemHeight(height);
    setWrapperHeight(wrapperHeight);
  };

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const isRichText = isItemType(item, ArticleItemType.RichText);

  const styles = {
    top: stickyTop,
    height: isRichText && itemHeight ? `${itemHeight * 100}vw` : 'unset'
  };

  return (
    <div
      className={`item-wrapper-${item.id}`}
      style={isInitialRef.current ? {} : { top, left, ...(wrapperHeight ? { height: `${wrapperHeight * 100}vw` } : {}) }}
    >
      <div
        suppressHydrationWarning={true}
        className={`item-${item.id}`}
        style={isInitialRef.current ? {} : styles }
      >
        <RichTextWrapper isRichText={isRichText}>
          <div
            className={`item-${item.id}-inner`}
            style={{
              width: `${sizingAxis.x === SizingType.Manual
                ? isRichText
                  ? `${width * exemplary}px`
                  : `${width * 100}vw`
                : 'max-content'}`,
              height: `${sizingAxis.y === SizingType.Manual ? `${height * 100}vw` : 'unset'}`,
              transform: `scale(${scale})`,
              transformOrigin: ScaleAnchorMap[scaleAnchor]
            }}
          >
            <ItemComponent item={item} sectionId={sectionId} onResize={handleItemResize} />
          </div>
        </RichTextWrapper>
      </div>
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, hidden, hoverParams, sticky, sectionHeight, layoutParams]) => {
          const sizingAxis = parseSizing(layoutParams.sizing);
          return (`
            .item-${item.id} {
              position: ${sticky ? 'sticky' : 'absolute'};
              top: ${sticky ? `${getAnchoredItemTop(area.top - sticky.from, sectionHeight, area.anchorSide)}` : 0};
              pointer-events: auto;
              cursor: ${hoverParams ? 'pointer' : 'default'};
              visibility: ${hidden ? 'hidden' : 'visible'};
              height: fit-content;
            }
            .item-${item.id}-inner {
              transition: ${getTransitions(['width', 'height', 'scale'], hoverParams)};
              width: ${sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'max-content'};
              height: ${sizingAxis.y === SizingType.Manual ? `${area.height * 100}vw` : 'unset'};
              transform: scale(${scale});
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
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
              height: ${sticky ? `${getStickyItemWrapperHeight(sticky, area.height, articleRatio) * 100}vw` : 'unset'};
              transition: ${getTransitions(['left', 'top'], hoverParams)};
            }
            .item-${item.id}-inner:hover {
              ${getHoverStyles(['width', 'height', 'scale'], hoverParams)}
            }
            .item-wrapper-${item.id}:hover {
              ${getHoverStyles(['left', 'top'], hoverParams, area.anchorSide)}
            }
          `);
      })}
      `}</JSXStyle>
    </div>
  );
};

function getStickyItemWrapperHeight(sticky: TStickyParams, itemHeight: number, articleHeight: number): number {
  const end = sticky.to ?? articleHeight;
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
