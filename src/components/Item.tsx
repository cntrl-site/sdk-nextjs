import {
  ArticleItemType,
  ArticleItemSizingType as SizingType,
  TArticleItem,
  TArticleItemAny,
  TStickyParams,
  getLayoutStyles
} from '@cntrl-site/sdk';
import { ComponentType, FC, useEffect, useRef } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../provider/useCntrlContext';
import { ScaleAnchorMap } from '../utils/ScaleAnchorMap';
import { getItemClassName } from '../utils/itemClassName';
import { CustomItem } from './items/CustomItem';
import { ImageItem } from './items/ImageItem';
import { RectangleItem } from './items/RectangleItem';
import { RichTextItem } from './items/RichTextItem';
import { VideoItem } from './items/VideoItem';
import { VimeoEmbedItem } from './items/VimeoEmbed';
import { YoutubeEmbedItem } from './items/YoutubeEmbed';
import { getItemTopStyle } from './useItemPosition';

export interface ItemProps<I extends TArticleItemAny> {
  item: I;
  sectionId: string;
  onResize?: (height: number) => void;
  className?: string;
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
  const { layouts } = useCntrlContext();
  const itemRef = useRef<HTMLDivElement>(null);

  const layoutValues = [
    item.area,
    item.hidden,
    item.sticky,
    item.layoutParams
  ] as const;
  const ItemComponent = itemsMap[item.type] || noop;

  useEffect(() => {
    const handleScroll = () => {
      const itemEl = itemRef.current;
      if (!itemEl) return;
      itemEl.style.setProperty('--sticky-top', `${itemEl.offsetTop}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={itemRef} className={getItemClassName(item.id, 'position')}>
      <div className={`${getItemClassName(item.id, 'size')} ${getItemClassName(item.id, 'scale')} ${getItemClassName(item.id, 'sticky')}`}>
        <ItemComponent
          className={`${getItemClassName(item.id, 'style')} ${getItemClassName(item.id, 'rotate')}`}
          item={item}
          sectionId={sectionId}
        />
      </div>
      <JSXStyle id={`item-${item.id}`}>
        {getLayoutStyles(layouts, layoutValues, ([area, hidden, sticky, layoutParams]) => {
          const sizingAxis = parseSizing('sizing' in layoutParams ? layoutParams.sizing : undefined);
          return `
            .${getItemClassName(item.id, 'position')} {
              position: absolute;
              z-index: ${area.zIndex};
              -webkit-transform: translate3d(0, 0, 0);
              transform: translate3d(0, 0, 0);
              pointer-events: none;
              top: ${getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
              height: ${sticky ? `${getStickyItemWrapperHeight(sticky, area.height) * 100}vw` : 'unset'};
            }

            .${getItemClassName(item.id, 'size')} {
              width: ${sizingAxis.x === SizingType.Manual ? `${area.width * 100}vw` : 'max-content'};
              height: ${sizingAxis.y === SizingType.Manual ? `${area.height * 100}vw` : 'unset'};
            }

            .${getItemClassName(item.id, 'scale')} {
              transform: scale(${area.scale});
              transform-origin: ${ScaleAnchorMap[area.scaleAnchor]};
            }

            .${getItemClassName(item.id, 'sticky')} {
              position: ${sticky ? 'sticky' : 'absolute'};
              top: ${sticky ? 'var(--sticky-top, 0)' : '0'};
            }

            .${getItemClassName(item.id, 'rotate')} {
              transform: rotate(${area.angle}deg);
              transform-origin: center center;
            }

            .${getItemClassName(item.id, 'style')} {
              width: 100%;
              height: 100%;
              pointer-events: all;
              visibility: ${hidden ? 'hidden' : 'visible'};
            }
          `;
        })}
      </JSXStyle>
    </div>
  );
};

function getStickyItemWrapperHeight(sticky: TStickyParams, itemHeight: number): number {
  const end = sticky.to ?? 100;
  return end - sticky.from + itemHeight;
}

function parseSizing(sizing: string = 'manual'): Axis {
  const axisSizing = sizing.split(' ');
  return {
    y: axisSizing[0],
    x: axisSizing[1] ?? axisSizing[0]
  } as Axis;
}

interface Axis {
  x: SizingType;
  y: SizingType;
}

export function isItemType<T extends ArticleItemType>(item: TArticleItemAny, itemType: T): item is TArticleItem<T> {
  return item.type === itemType;
}
