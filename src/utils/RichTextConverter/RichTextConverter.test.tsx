import { Layout, RichTextItem } from '@cntrl-site/sdk';
import { RichTextConverter } from './RichTextConverter';

const layouts: Layout[] = [{ id: 'desktop', title: 'Desktop', startsWith: 800, exemplary: 1440 }];

// the converter reads only the text, its blocks and each layout's range styles
const richText = {
  id: 'text',
  commonParams: { text: 'WA\n', blocks: [{ start: 0, end: 2, type: 'unstyled', entities: [] }] },
  layoutParams: { desktop: { rangeStyles: [{ start: 0, end: 1, style: 'LETTERSPACING', value: '0.01' }], textAlign: 'left' } }
} as unknown as RichTextItem;

describe('RichTextConverter', () => {
  it('sizes a letter-spacing range in pixels of the exemplary and in viewport units while the layout is pending', () => {
    const [, styles] = new RichTextConverter().toHtml(richText, layouts);
    expect(styles).toContain('letter-spacing: 14.4px');
    expect(styles).toContain('letter-spacing: 1vw');
  });
});
