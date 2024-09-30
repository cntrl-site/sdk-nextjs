import { RichTextItem } from '@cntrl-site/sdk';
import { RichTextConverter } from '../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ReactNode } from 'react';

const richTextConverter = new RichTextConverter();

export const useRichTextItem = (item: RichTextItem, isInteractive: boolean): [ReactNode[], string] => {
  const { layouts } = useCntrlContext();
  const [content, styles] = richTextConverter.toHtml(item, layouts, isInteractive);
  return [content, styles];
};
