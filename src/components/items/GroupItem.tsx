import React, { FC, useId, useState } from 'react';
import { Item, ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { getLayoutStyles, GroupItem as TGroupItem } from '@cntrl-site/sdk';
import { LinkWrapper } from '../LinkWrapper';
import { useRegisterResize } from '../../common/useRegisterResize';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useItemAngle } from '../useItemAngle';
import { useGroupItem } from './useGroupItem';
import { useStatesClassNames } from '../useStatesClassNames';
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesTransitions } from '../useStatesTransitions';

export const GroupItem: FC<ItemProps<TGroupItem>> = ({ item, sectionId, onResize, articleHeight }) => {
  const id = useId();
  const { items } = item;
  const angle = useItemAngle(item, sectionId);
  const { layouts } = useCntrlContext();
  const { opacity } = useGroupItem(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state];
  const statesClassNames = useStatesClassNames(item.id, item.state, 'group');
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  useStatesTransitions(ref!, item.state, ['opacity', 'angle'])

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`group-${item.id} ${statesClassNames}`}
          ref={setRef}
          style={{
            ...(opacity !== undefined ? { opacity } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          }}
        >
          {items && items.map(item => (
            <Item
              item={item}
              key={item.id}
              sectionId={sectionId}
              articleHeight={articleHeight}
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
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, stateParams]) => {
          const statesCSS = getStatesCSS(item.id, 'group', ['opacity', 'angle'], stateParams);
          return (`
            .group-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
              transition: all 0.2s ease;
            }
            ${statesCSS}
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
