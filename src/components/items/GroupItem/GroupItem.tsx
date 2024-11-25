import React, { FC, useEffect, useId, useState } from 'react';
import { Item, ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { getLayoutStyles, GroupItem as TGroupItem } from '@cntrl-site/sdk';
import { LinkWrapper } from '../LinkWrapper';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemAngle } from '../useItemAngle';
import { useGroupItem } from './useGroupItem';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';

export const GroupItem: FC<ItemProps<TGroupItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { items } = item;
  const itemAngle = useItemAngle(item, sectionId);
  const { layouts } = useCntrlContext();
  const { opacity: itemOpacity } = useGroupItem(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState(['opacity', 'angle']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  const isInteractive = opacity !== 0 && opacity !== undefined;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`group-${item.id}`}
          ref={setRef}
          style={{
            ...(opacity !== undefined ? { opacity } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            transition: stateParams?.transition ?? 'none'
          }}
        >
          {items && items.map(item => (
            <Item
              item={item}
              key={item.id}
              sectionId={sectionId}
              isParentVisible={isInteractive}
              isInGroup
            />
          ))}
        </div>
        <JSXStyle id={id}>{`
        .group-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          return (`
            .group-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};