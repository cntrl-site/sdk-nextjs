import { FC } from 'react';
import { TRectangleItem, getLayoutStyles } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useCntrlContext } from '../../provider/useCntrlContext';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item }) => {
  const { layouts } = useCntrlContext();
  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`rectangle-${item.id}`} />
        <style jsx>{`
      ${getLayoutStyles(layouts, [item.layoutParams], ([{ strokeColor, fillColor, radius, strokeWidth }]) => (`
         .rectangle-${item.id} {
            position: absolute;
            width: 100%;
            height: 100%;
            border-style: solid;
            box-sizing: border-box;
            border-color: ${strokeColor};
            background-color: ${fillColor};
            border-radius: ${radius * 100}vw;
            border-width: ${strokeWidth * 100}vw;
          }`
        ))}
      `}</style>
      </>
    </LinkWrapper>
  );
};
