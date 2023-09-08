import { TRichTextItem, TTypePresetEntry } from '@cntrl-site/sdk';
import { RichTextConverter } from '../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ReactNode } from 'react';
import { useLayoutContext } from '../useLayoutContext';

const richTextConv = new RichTextConverter();

export const useRichTextItem = (item: TRichTextItem): [ReactNode[], string, TTypePresetEntry | null] => {
  const layoutId = useLayoutContext();
  const { layouts, typePresets } = useCntrlContext();
  const presetId = layoutId ? item.layoutParams[layoutId].preset : null;
  const preset = presetId
    ? typePresets?.presets.find(p => p.id === presetId) ?? null
    : null;
  const [content, styles] = richTextConv.toHtml(item, layouts, !!preset);
  return [content, styles, preset];
};
