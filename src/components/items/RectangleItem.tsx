import { FC, useEffect, useState } from 'react';
import { TRectangleItem, CntrlColor } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item }) => {
  const { fillColor, radius, strokeWidth, strokeColor } = useRectangleItem(item);

  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`rectangle-${item.id}`}
          style={{
            backgroundColor: `${fillColor}`,
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            borderColor: `${strokeColor}`
          }}
        />
        <style jsx>{`
         .rectangle-${item.id} {
            position: absolute;
            width: 100%;
            height: 100%;
            border-style: solid;
            box-sizing: border-box;
          }
      `}</style>
      </>
    </LinkWrapper>
  );
};
