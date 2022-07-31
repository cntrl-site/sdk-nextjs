import { FC } from 'react';
import { TRichTextItem } from '@cntrl-site/core';
//@ts-ignore
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { RichTextConverter } from '../../utils/RichTextConverter';

const richTextConv = new RichTextConverter();

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, layouts }) => {
  const [content, styles] = richTextConv.toHtml(item, layouts);
  return (
    <>
      <div className="rich-text">{content}</div>
      <JSXStyle id={item.id}>
        {styles}
      </JSXStyle>
    </>
  );
};
