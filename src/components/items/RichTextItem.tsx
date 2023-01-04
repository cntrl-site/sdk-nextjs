import { FC, createElement } from 'react';
import { TRichTextItem } from '@cntrl-site/sdk';
//@ts-ignore
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { RichTextConverter } from '../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../provider/useCntrlContext';

const richTextConv = new RichTextConverter();

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item }) => {
  const { layouts, typePresets } = useCntrlContext();
  const preset = item.commonParams.preset
    ? typePresets?.presets.find(p => p.id === item.commonParams.preset)
    : null;
  const [content, styles] = richTextConv.toHtml(item, layouts, !!preset);
  return createElement(
    preset?.tag ?? 'div',
    {
      className: preset ? `cntrl-preset-${preset.id}` : undefined
    },
    (
      <>
        {content}
        <JSXStyle id={item.id}>
          {styles}
        </JSXStyle>
      </>
    )
  );
};
