import { ComponentType, FC, PropsWithChildren, useContext, useEffect, useId, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  ArticleItemType,
  getLayoutStyles,
  Item as TItem,
  ItemAny,
  PositionType
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
import { ArticleRectContext } from "../provider/ArticleRectContext";
import { useExemplary } from "../common/useExemplary";

export interface ItemProps<I extends ItemAny> {
  item: I;
  sectionId: string;
  onResize?: (height: number) => void;
}

export interface ItemWrapperProps extends ItemProps<ItemAny> {
  articleHeight: number;
}

const itemsMap: Record<ArticleItemType, ComponentType<ItemProps<any>>> = {
  [ArticleItemType.Rectangle]: RectangleItem,
  [ArticleItemType.Image]: ImageItem,
  [ArticleItemType.Video]: VideoItem,
  [ArticleItemType.RichText]: RichTextItem,
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedItem,
  [ArticleItemType.VimeoEmbed]: VimeoEmbedItem,
  [ArticleItemType.Custom]: CustomItem,
  [ArticleItemType.Group]: () => null
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

export const Item: FC<ItemWrapperProps> = ({ item, sectionId, articleHeight }) => {
  const itemWrapperRef = useRef<HTMLDivElement | null>(null);
  const rectObserver = useContext(ArticleRectContext);
  const id = useId();
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const exemplary = useExemplary();
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
  const sectionTop = rectObserver ? rectObserver.getSectionTop(sectionId) : 0;

  const handleItemResize = (height: number) => {
    if (!layout) return;
    const sticky = item.sticky[layout];
    if (!sticky) {
      setWrapperHeight(undefined);
      return;
    }
    const itemArticleOffset = sectionTop / window.innerWidth + stickyTop;
    const maxStickyTo = articleHeight - itemArticleOffset - height;
    const end = sticky.to
      ? Math.min(maxStickyTo, sticky.to)
      : articleHeight - itemArticleOffset - height;
    const wrapperHeight = end - sticky.from + height;
    setItemHeight(height);
    setWrapperHeight(wrapperHeight);
  };

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const isRichText = isItemType(item, ArticleItemType.RichText);

  if (!layout) return null;
  const styles = {
    top: `${stickyTop * 100}vw`,
    height: isRichText && itemHeight ? `${itemHeight * 100}vw` : 'unset'
  };

  return (
    <div
      className={`item-wrapper-${item.id}`}
      ref={itemWrapperRef}
      style={isInitialRef.current ? {} : { top, left, ...(wrapperHeight !== undefined ? { height: `${wrapperHeight * 100}vw` } : {}) }}
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
              width: `${sizingAxis.x === 'manual'
                ? isRichText
                  ? `${width * exemplary}px`
                  : `${width * 100}vw`
                : 'max-content'}`,
              height: `${sizingAxis.y === 'manual' ? `${height * 100}vw` : 'unset'}`,
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
              display: ${hidden ? 'none' : 'block'};
              height: fit-content;
            }
            .item-${item.id}-inner {
              transition: ${getTransitions(['width', 'height', 'scale'], hoverParams)};
              width: ${sizingAxis.x === 'manual' ? `${area.width * 100}vw` : 'max-content'};
              height: ${sizingAxis.y === 'manual' ? `${area.height * 100}vw` : 'unset'};
              transform: scale(${scale});
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
              --webkit-backface-visibility: hidden;
            }
            .item-wrapper-${item.id} {
              position: ${area.positionType === PositionType.ScreenBased ? 'fixed': 'absolute'};
              z-index: ${area.zIndex};
              -webkit-transform: translate3d(0, 0, 0);
              transform: translate3d(0, 0, 0);
              pointer-events: none;
              top: ${getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
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

function parseSizing(sizing: string = 'manual'): Axis {
  const axisSizing = sizing.split(' ');
  return {
    y: axisSizing[0],
    x: axisSizing[1] ? axisSizing[1] : axisSizing[0]
  } as Axis;
}

interface Axis {
  x: 'manual' | 'auto';
  y: 'manual' | 'auto';
}

export function isItemType<T extends ArticleItemType>(item: ItemAny, itemType: T): item is TItem<T> {
  return item.type === itemType;
}
