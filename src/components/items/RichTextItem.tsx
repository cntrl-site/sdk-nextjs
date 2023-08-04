import { TRichTextItem } from '@cntrl-site/sdk';
import { FC } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item }) => {
  const [content, styles, preset] = useRichTextItem(item);
  const className = preset ? `cntrl-preset-${preset.id}` : undefined;

  return (
    <>
      <div className={className}>
        {content}
      </div>
      <JSXStyle id={`richtext-${item.id}-text`}>
        {styles}
      </JSXStyle>
    </>
  );
};
