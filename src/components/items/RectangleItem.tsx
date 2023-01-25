import { FC } from 'react';
import { TRectangleItem, getLayoutStyles } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useRectangleItem } from './useRectangleItem';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item }) => {
  const { layouts } = useCntrlContext();
  const { fillColor, radius, strokeWidth } = useRectangleItem(item);
  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`rectangle-${item.id}`}
          style={{
            backgroundColor: `${fillColor}`,
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`
          }}
        />
        <style jsx>{`
      ${getLayoutStyles(layouts, [item.layoutParams], ([{ strokeColor }]) => (`
         .rectangle-${item.id} {
            position: absolute;
            width: 100%;
            height: 100%;
            border-style: solid;
            box-sizing: border-box;
            border-color: ${strokeColor};
          }`
        ))}
      `}</style>
      </>
    </LinkWrapper>
  );
};
