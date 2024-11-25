import React, {
  FC,
  useEffect,
  useId,
  useRef,
} from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useLayoutContext } from '../../useLayoutContext';
import { useExemplary } from '../../../common/useExemplary';
import { useItemScale } from '../useItemScale';
import { useItemInteractionCtrl } from '../../../interactions/useItemInteractionCtrl';
import { ArticleItemType, getLayoutStyles, ItemAny, AreaAnchor } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';
import { ScaleAnchorMap } from '../../../utils/ScaleAnchorMap';
import { isItemType } from '../../../utils/isItemType';
import { RichTextWrapper } from '../RichTextWrapper';
import { itemsMap } from '../itemsMap';
import {
  getCompoundHeight,
  getCompoundLeft,
  getCompoundTop, getCompoundTransform,
  getCompoundWidth
} from '../../../utils/getCompoundBondaryStyles';
import { useItemTriggers } from '../useItemTriggers';
import { parseSizing, useSizing } from '../useSizing';
import { useItemPointerEvents } from '../useItemPointerEvents';
import { useItemArea } from '../useItemArea';

interface ChildItemProps {
  item: ItemAny;
  sectionId: string;
  isParentVisible?: boolean;
}

const noop = () => null;

export const CompoundChild: FC<ChildItemProps> = ({ item, sectionId, isParentVisible = true }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const exemplary = useExemplary();
  const { handleVisibilityChange, allowPointerEvents } = useItemPointerEvents(isParentVisible);
  const itemScale = useItemScale(item, sectionId);
  const interactionCtrl = useItemInteractionCtrl(item.id);
  const triggers = useItemTriggers(interactionCtrl);
  const stateProps = interactionCtrl?.getState(['top', 'left', 'width', 'height', 'scale']);
  const compoundSettings = layout && item.compoundSettings ? item.compoundSettings[layout] : undefined;
  const { width, height, top, left } = useItemArea(item, sectionId, {
    top: stateProps?.styles?.top as number,
    left: stateProps?.styles?.left as number,
    width: stateProps?.styles?.width as number,
    height: stateProps?.styles?.height as number
  });
  const isInitialRef = useRef(true);
  const sizingAxis = useSizing(item);
  const ItemComponent = itemsMap[item.type] || noop;

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const transformOrigin = compoundSettings ? ScaleAnchorMap[compoundSettings.positionAnchor] : 'top left';
  const isRichText = isItemType(item, ArticleItemType.RichText);
  const scale = stateProps?.styles?.scale ?? itemScale;
  const hasClickTriggers = interactionCtrl?.getHasTrigger(item.id, 'click') ?? false;
  if (!item.compoundSettings) return null;
  const layoutValues: Record<string, any>[] = [item.area, item.hidden, item.compoundSettings];
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }
  return (
    <div
      className={`item-${item.id}`}
      onTransitionEnd={(e) => {
        e.stopPropagation();
        interactionCtrl?.handleTransitionEnd?.(e.propertyName);
      }}
      style={{
        ...(top && compoundSettings ? { top: getCompoundTop(compoundSettings, top) } : {}),
        ...(left && compoundSettings ? { left: getCompoundLeft(compoundSettings, left) } : {}),
        ...(width && compoundSettings
          ? { width: `${sizingAxis.x === 'manual' 
              ? getCompoundWidth(compoundSettings, width, isRichText, exemplary) 
              : 'max-content'}` }
          : {}),
        ...(height && compoundSettings
          ? { height: `${sizingAxis.y === 'manual' 
              ? getCompoundHeight(compoundSettings, height) 
              : 'unset'}` }
          : {}),
        ...(scale && compoundSettings ? { transform: `scale(${scale}) ${getCompoundTransform(compoundSettings)}` } : {}),
        transition: stateProps?.transition ?? 'none',
        cursor: hasClickTriggers ? 'pointer' : 'unset',
        pointerEvents: allowPointerEvents ? 'auto' : 'none'
      }}
      {...triggers}
    >
      <RichTextWrapper isRichText={isRichText} transformOrigin={transformOrigin}>
        <ItemComponent
          item={item}
          sectionId={sectionId}
          interactionCtrl={interactionCtrl}
          onVisibilityChange={handleVisibilityChange}
        />
      </RichTextWrapper>
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, hidden, compoundSettings, layoutParams]) => {
          const sizingAxis = parseSizing(layoutParams.sizing);
          const scaleAnchor = area.scaleAnchor as AreaAnchor;
          return (`
            .item-${item.id} {
              position: absolute;
              top: ${getCompoundTop(compoundSettings, area.top)};
              left: ${getCompoundLeft(compoundSettings, area.left)};
              transition: opacity 0.2s linear 0.1s;
              display: ${hidden ? 'none' : 'block'};
              width: ${sizingAxis.x === 'manual'
                ? `${getCompoundWidth(compoundSettings, area.width, isRichText)}`
                : 'max-content'};
              height: ${sizingAxis.y === 'manual' ? `${getCompoundHeight(compoundSettings, area.height)}` : 'unset'};
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
              transform: scale(${area.scale}) ${getCompoundTransform(compoundSettings)};
              z-index: ${area.zIndex};
            }
          `);
      })}
      `}</JSXStyle>
    </div>
  );
};