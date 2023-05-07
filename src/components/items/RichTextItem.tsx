import { FC } from 'react';
import { TRichTextItem } from '@cntrl-site/sdk';
//@ts-ignore
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useItemAngle } from '../useItemAngle';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item }) => {
  const [content, styles, preset] = useRichTextItem(item);
  const angle = useItemAngle(item);
  const className = preset ? `cntrl-preset-${preset.id}` : undefined;
  return (
    <>
      <div className={className}
           style={{
             transform: `rotate(${angle}deg)`
           }}>{content}</div>
      <JSXStyle id={item.id}>
        {styles}
      </JSXStyle>
    </>
  );
};
