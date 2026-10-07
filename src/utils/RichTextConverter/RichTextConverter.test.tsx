import { Layout, RichTextItem } from '@cntrl-site/sdk';
import { RichTextConverter } from './RichTextConverter';

const layouts: Layout[] = [{ id: 'desktop', title: 'Desktop', startsWith: 800, exemplary: 1440 }];

// the converter reads only the text, its blocks and each layout's range styles
const richText = {
  id: 'text',
  commonParams: { text: 'WA\n', blocks: [{ start: 0, end: 2, type: 'unstyled', entities: [] }] },
  layoutParams: { desktop: { rangeStyles: [{ start: 0, end: 1, style: 'LETTERSPACING', value: '0' }], textAlign: 'left' } }
} as unknown as RichTextItem;

describe('RichTextConverter', () => {
  it('keeps a letter-spacing range in its own shaping run even when it equals the surrounding spacing', () => {
    const [, styles] = new RichTextConverter().toHtml(richText, layouts);
    expect(styles).toContain('letter-spacing: calc(0px + 0.001px)');
    expect(styles).toContain('letter-spacing: calc(0vw + 0.001px)');
  });
});
