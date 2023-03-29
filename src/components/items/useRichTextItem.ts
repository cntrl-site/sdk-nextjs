import { TRichTextItem, TTypePresetEntry } from '@cntrl-site/sdk';
import { useCurrentLayout } from '../../common/useCurrentLayout';
import { RichTextConverter } from '../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ReactNode } from 'react';

const richTextConv = new RichTextConverter();

export const useRichTextItem = (item: TRichTextItem): [ReactNode[], string, TTypePresetEntry | null] => {
  const layoutId = useCurrentLayout();
  const { layouts, typePresets } = useCntrlContext();
  const presetId = item.layoutParams[layoutId].preset;
  const preset = presetId
    ? typePresets?.presets.find(p => p.id === presetId) ?? null
    : null;
  const [content, styles] = richTextConv.toHtml(item, layouts, !!preset);
  return [content, styles, preset];
};
