import { RichTextItem } from '@cntrl-site/sdk';
import { RichTextConverter } from '../../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { ReactNode } from 'react';

const richTextConverter = new RichTextConverter();

export function useRichTextItem(item: RichTextItem): [ReactNode[], string, string | undefined] {
  const { layouts } = useCntrlContext();
  return richTextConverter.toHtml(item, layouts);
}
