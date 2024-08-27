import { ComponentType, FC, PropsWithChildren, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  AnchorSide,
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
import { getItemTopStyle } from '../utils/getItemTopStyle';
import { useStickyItemTop } from './items/useStickyItemTop';
import { getAnchoredItemTop } from '../utils/getAnchoredItemTop';
import { useLayoutContext } from './useLayoutContext';
import { ArticleRectContext } from "../provider/ArticleRectContext";
import { useExemplary } from "../common/useExemplary";
import { GroupItem } from './items/GroupItem';
import { CodeEmbedItem } from './items/CodeEmbedItem';
import { AreaAnchor } from '@cntrl-site/sdk/src/types/article/ItemArea';
import { KeyframesContext } from '../provider/KeyframesContext';
import { InteractionsContext } from '../provider/InteractionsContext';
import { getStatesCSS } from '../utils/getStatesCSS';
import { useStatesClassNames } from './useStatesClassNames';

export interface ItemProps<I extends ItemAny> {
  item: I;
  sectionId: string;
  onResize?: (height: number) => void;
  articleHeight: number;
}

export interface ItemWrapperProps extends ItemProps<ItemAny> {
  articleHeight: number;
  isInGroup?: boolean;
}

const itemsMap: Record<ArticleItemType, ComponentType<ItemProps<any>>> = {
  [ArticleItemType.Rectangle]: RectangleItem,
  [ArticleItemType.Image]: ImageItem,
  [ArticleItemType.Video]: VideoItem,
  [ArticleItemType.RichText]: RichTextItem,
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedItem,
  [ArticleItemType.VimeoEmbed]: VimeoEmbedItem,
  [ArticleItemType.Custom]: CustomItem,
  [ArticleItemType.Group]: GroupItem,
  [ArticleItemType.CodeEmbed]: CodeEmbedItem
};

interface RTWrapperProps {
  isRichText: boolean;
}

const stickyFix = `
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
`;

const RichTextWrapper: FC<PropsWithChildren<RTWrapperProps>> = ({ isRichText, children }) => {
  if (!isRichText) return <>{children}</>;
  return (
    <div style={{ transformOrigin: 'top left', transform: 'scale(var(--layout-deviation))' }}>
      {children}
    </div>
  );
};

const noop = () => null;

export const Item: FC<ItemWrapperProps> = ({ item, sectionId, articleHeight, isInGroup = false }) => {
  const itemWrapperRef = useRef<HTMLDivElement | null>(null);
  const rectObserver = useContext(ArticleRectContext);
  const keyframesRepo = useContext(KeyframesContext);
  const id = useId();
  const keyframes = useMemo(() => keyframesRepo.getItemKeyframes(item.id), [keyframesRepo, item.id]);
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const exemplary = useExemplary();
  const [wrapperHeight, setWrapperHeight] = useState<undefined | number>(undefined);
  const [itemHeight, setItemHeight] = useState<undefined | number>(undefined);
  const scale = useItemScale(item, sectionId);
  const position = useItemPosition(item, sectionId);
  const sectionHeight = useSectionHeightData(sectionId);
  const stickyTop = useStickyItemTop(item, sectionHeight, sectionId);
  const dimensions = useItemDimensions(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.hidden, item.state];
  const isInitialRef = useRef(true);
  const { transitionTo, getItemTrigger } = useContext(InteractionsContext);
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
    if (!sticky || stickyTop === undefined) {
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
  const innerStatesClassNames = useStatesClassNames(item.id, item.state, 'item-inner');
  const wrapperStatesClassNames = useStatesClassNames(item.id, item.state, 'item-wrapper');
  return (
    <div
      className={`item-wrapper-${item.id} ${wrapperStatesClassNames}`}
      ref={itemWrapperRef}
      style={{
        ...(position ? { top: position.top } : {}),
        ...(position ? { left: position.left } : {}),
        ...(position ? { bottom: position.bottom } : {}),
        ...(wrapperHeight !== undefined ? { height: `${wrapperHeight * 100}vw` } : {})
      }}
    >
      <div
        suppressHydrationWarning={true}
        className={`item-${item.id}`}
        style={{
          opacity: (keyframes.length !== 0 && !layout) ? 0 : 1,
          top: `${stickyTop * 100}vw`,
          height: isRichText && itemHeight ? `${itemHeight * 100}vw` : 'unset',
        }}
      >
        <RichTextWrapper isRichText={isRichText}>
          <div
            className={`item-${item.id}-inner ${innerStatesClassNames}`}
            onClick={() => {
              const trigger = getItemTrigger(item.id, 'click');
              if (!trigger) return;
              transitionTo(trigger.id, trigger.to);
            }}
            onMouseEnter={() => {
              const trigger = getItemTrigger(item.id, 'hover-in');
              if (!trigger) return;
              transitionTo(trigger.id, trigger.to);
            }}
            onMouseLeave={() => {
              const trigger = getItemTrigger(item.id, 'hover-out');
              if (!trigger) return;
              transitionTo(trigger.id, trigger.to);
            }}
            style={{
              ...(dimensions ? {
                width: `${sizingAxis.x === 'manual'
                  ? isRichText
                    ? `${dimensions.width * exemplary}px`
                    : `${dimensions.width * 100}vw`
                  : 'max-content'}`,
                height: `${sizingAxis.y === 'manual' ? `${dimensions.height * 100}vw` : 'unset'}` } : {}),
              ...(scale !== undefined ? { transform: `scale(${scale})`, 'WebkitTransform': `scale(${scale})` } : {}),
            }}
          >
            <ItemComponent item={item} sectionId={sectionId} onResize={handleItemResize} articleHeight={articleHeight} />
          </div>
        </RichTextWrapper>
      </div>
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, hidden, states, sticky, sectionHeight, layoutParams], exemplary) => {
          const sizingAxis = parseSizing(layoutParams.sizing);
          const isScreenBasedBottom = area.positionType === PositionType.ScreenBased && area.anchorSide === AnchorSide.Bottom;
          const scaleAnchor = area.scaleAnchor as AreaAnchor;
          const statesInnerCSS = getStatesCSS(item.id, 'item-inner', ['width', 'height', 'scale'], states);
          const statesWrapperCSS = getStatesCSS(item.id, 'item-wrapper', ['top', 'left'], states, area.anchorSide);
          return (`
            .item-${item.id} {
              position: ${sticky ? 'sticky' : 'absolute'};
              top: ${sticky ? `${getAnchoredItemTop(area.top - sticky.from, sectionHeight, area.anchorSide)}` : 0};
              transition: opacity 0.2s linear 0.1s;
              pointer-events: none;
              display: ${hidden ? 'none' : 'block'};
              height: fit-content;
            }
            .item-${item.id}-inner {
              transition: ${getTransitions(['width', 'height', 'scale'], hoverParams)};
              pointer-events: auto;
              width: ${sizingAxis.x === 'manual'
                ? `${area.width * 100}vw`
                : 'max-content'};
              height: ${sizingAxis.y === 'manual' ? `${area.height * 100}vw` : 'unset'};
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
              transform: scale(${area.scale});
              transition: all 0.2s ease;
            }
            .item-wrapper-${item.id} {
              position: ${area.positionType === PositionType.ScreenBased ? 'fixed': 'absolute'};
              z-index: ${area.zIndex};
              ${!isInGroup && stickyFix}
              pointer-events: none;
              bottom: ${isScreenBasedBottom ? `${-area.top * 100}vw` : 'unset'};
              top: ${isScreenBasedBottom ? 'unset' : getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
              transition: all 0.2s ease;
            }
            ${statesWrapperCSS}
            ${statesInnerCSS}
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

export function isItemType<T extends ArticleItemType>(item: ItemAny, itemType: T): item is TItem<T> {
  return item.type === itemType;
}

interface Axis {
  x: 'manual' | 'auto';
  y: 'manual' | 'auto';
}
