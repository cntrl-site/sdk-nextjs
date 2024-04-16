import React, { FC, useId, useState } from 'react';
import { Item, ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { ArticleItemType, getLayoutStyles, GroupItem as TGroupItem } from '@cntrl-site/sdk';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import { LinkWrapper } from '../LinkWrapper';
import { useRegisterResize } from '../../common/useRegisterResize';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useItemAngle } from '../useItemAngle';
import { useGroupItem } from './useGroupItem';

export const GroupItem: FC<ItemProps<TGroupItem>> = ({ item, sectionId, onResize, articleHeight }) => {
  const id = useId();
  const { items } = item;
  const angle = useItemAngle(item, sectionId);
  const { layouts } = useCntrlContext();
  const { opacity } = useGroupItem(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state.hover];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`group-${item.id}`}
          ref={setRef}
          style={{
            opacity,
            transform: `rotate(${angle}deg)`,
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
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, hoverParams]) => {
          return (`
            .group-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
              transition: ${getTransitions<ArticleItemType.Group>(['opacity', 'angle'], hoverParams)};
            }
            .group-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Group>(['opacity', 'angle'], hoverParams)};
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
