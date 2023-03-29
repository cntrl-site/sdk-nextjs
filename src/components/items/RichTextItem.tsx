import { FC, createElement } from 'react';
import { TRichTextItem } from '@cntrl-site/sdk';
//@ts-ignore
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { RichTextConverter } from '../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useRichTextItem } from './useRichTextItem';

const richTextConv = new RichTextConverter();

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item }) => {
  const [content, styles, preset] = useRichTextItem(item);
  const className = preset ? `cntrl-preset-${preset.id}` : undefined;
  return (
    <>
      <div className={className}>{content}</div>
      <JSXStyle id={item.id}>
        {styles}
      </JSXStyle>
    </>
  );
};
