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
import { CompoundChild } from '../CompoundItem/CompoundChild';

export const GroupItem: FC<ItemProps<TGroupItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange, isInCompound }) => {
  const id = useId();
  const { items } = item;
  const itemAngle = useItemAngle(item, sectionId);
  const { layouts } = useCntrlContext();
  const { opacity: itemOpacity, blur: itemBlur } = useGroupItem(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState(['opacity', 'angle', 'blur']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(stateParams?.styles?.blur, itemBlur);
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
            ...(angle !== undefined ? { transform: `rotate(${angle}deg) translateZ(0)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            transition: stateParams?.transition ?? 'none'
          }}
        >
          {items && items.map(item => isInCompound ? (
            <CompoundChild
              item={item}
              key={item.id}
              sectionId={sectionId}
              isParentVisible={isInteractive}
            />
          ) : (
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
              transform: rotate(${area.angle}deg) translateZ(0);
            }
          `);
    })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
