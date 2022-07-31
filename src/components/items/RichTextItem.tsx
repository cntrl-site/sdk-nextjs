import { FC } from 'react';
import { TRichTextItem } from '@cntrl-site/core';
//@ts-ignore
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { RichTextConv } from '../../utils/RichTextConv';

const richTextConv = new RichTextConv();

const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, layouts }) => {
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

export default RichTextItem;
