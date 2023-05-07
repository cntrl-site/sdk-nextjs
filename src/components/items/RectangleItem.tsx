import { FC, useMemo } from 'react';
import { TRectangleItem, CntrlColor } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item }) => {
  const { fillColor, radius, strokeWidth, strokeColor } = useRectangleItem(item);
  const angle = useItemAngle(item);
  const backgroundColor = useMemo(() => CntrlColor.parse(fillColor).toCss(), [fillColor]);
  const borderColor = useMemo(() => CntrlColor.parse(strokeColor).toCss(), [strokeColor]);

  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`rectangle-${item.id}`}
          style={{
            backgroundColor: `${backgroundColor}`,
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            borderColor: `${borderColor}`,
            transform: `rotate(${angle}deg)`
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
