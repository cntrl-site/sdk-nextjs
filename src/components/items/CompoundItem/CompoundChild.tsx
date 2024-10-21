import React, {
  FC,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useLayoutContext } from '../../useLayoutContext';
import { useExemplary } from '../../../common/useExemplary';
import { useItemScale } from '../useItemScale';
import { useItemInteractionCtrl } from '../../../interactions/useItemInteractionCtrl';
import { useItemPosition } from '../useItemPosition';
import { useItemDimensions } from '../useItemDimensions';
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
  const [allowPointerEvents, setAllowPointerEvents] = useState<boolean>(isParentVisible);
  const itemScale = useItemScale(item, sectionId);
  const interactionCtrl = useItemInteractionCtrl(item.id);
  const wrapperStateProps = interactionCtrl?.getState(['top', 'left']);
  const innerStateProps = interactionCtrl?.getState(['width', 'height', 'scale']);
  const position = useItemPosition(item, sectionId, {
    top: wrapperStateProps?.styles?.top as number,
    left: wrapperStateProps?.styles?.left as number,
  });
  const compoundSettings = layout && item.compoundSettings ? item.compoundSettings[layout] : undefined;
  const dimensions = useItemDimensions(item, sectionId);
  const isInitialRef = useRef(true);
  const sizing = layout && isItemType(item, ArticleItemType.RichText)
    ? item.layoutParams[layout].sizing
    : undefined;
  const sizingAxis = parseSizing(sizing);
  const ItemComponent = itemsMap[item.type] || noop;
  const handleVisibilityChange = useCallback((isVisible: boolean) => {
    if (!isParentVisible) return;
    setAllowPointerEvents(isVisible);
  }, [isParentVisible]);

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const transformOrigin = compoundSettings ? ScaleAnchorMap[compoundSettings.positionAnchor] : 'top left';
  const isRichText = isItemType(item, ArticleItemType.RichText);
  const width = (innerStateProps?.styles?.width ?? dimensions?.width) as number | undefined;
  const height = (innerStateProps?.styles?.height ?? dimensions?.height) as number | undefined;
  const scale = innerStateProps?.styles?.scale ?? itemScale;
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
        ...(position && compoundSettings ? { top: getCompoundTop(compoundSettings, position.top) } : {}),
        ...(position && compoundSettings ? { left: getCompoundLeft(compoundSettings, position.left) } : {}),
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
        transition: innerStateProps?.transition ?? 'none',
        cursor: hasClickTriggers ? 'pointer' : 'unset',
        pointerEvents: allowPointerEvents ? 'auto' : 'none'
      }}
      onClick={() => {
        interactionCtrl?.sendTrigger('click');
      }}
      onMouseEnter={() => {
        interactionCtrl?.sendTrigger('hover-in');
      }}
      onMouseLeave={() => {
        interactionCtrl?.sendTrigger('hover-out');
      }}
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
