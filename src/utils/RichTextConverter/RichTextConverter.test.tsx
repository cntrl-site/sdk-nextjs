import { render } from '@testing-library/react';
import { Layout, TextAlign } from '@cntrl-site/sdk';
import { RICH_TEXT_LAYOUT_PENDING_CLASS, RichTextConverter, RichTextSource } from './RichTextConverter';

const layouts: Layout[] = [{ id: 'desktop', title: 'Desktop', startsWith: 800, exemplary: 1440 }];

function text(blocks: { text: string; type?: string }[], rangeStyles = [{ start: 0, end: 4, style: 'FONTSIZE', value: '0.02' }]): RichTextSource {
  let offset = 0;
  const richTextBlocks = blocks.map(({ text, type = 'unstyled' }) => {
    const block = { start: offset, end: offset + text.length, type, entities: [] };
    offset += text.length + 1;
    return block;
  });
  return {
    id: 'text',
    commonParams: { text: blocks.map(block => `${block.text}\n`).join(''), blocks: richTextBlocks },
    layoutParams: { desktop: { rangeStyles, textAlign: TextAlign.Left } }
  };
}

describe('RichTextConverter', () => {
  const converter = new RichTextConverter();

  it('sizes an item\'s ranges in pixels of the exemplary, in viewport units while the layout is not known', () => {
    const [, styles] = converter.toHtml(text([{ text: 'Read on' }]), layouts);
    expect(styles).toContain('font-size: 28.8px');
    expect(styles).toContain(`.${RICH_TEXT_LAYOUT_PENDING_CLASS}`);
  });

  it('sizes the ranges of text in the page\'s flow in viewport units throughout', () => {
    const [, styles] = converter.toHtml(text([{ text: 'Read on' }]), layouts, { isScaledToViewport: false });
    expect(styles).toContain('font-size: 2vw');
    expect(styles).not.toMatch(/font-size: [\d.]+px/);
    expect(styles).not.toContain(RICH_TEXT_LAYOUT_PENDING_CLASS);
  });

  it('draws list items with their markers, a numbered run restarting after anything else', () => {
    const [content, styles] = converter.toHtml(text([
      { text: 'Intro' },
      { text: 'One', type: 'ordered-list-item' },
      { text: 'Two', type: 'ordered-list-item' },
      { text: 'Dot', type: 'unordered-list-item' }
    ], []), layouts, { isScaledToViewport: false });
    const { container } = render(<>{content}</>);
    expect([...container.children].map(child => child.className.split(' ')[1])).toEqual([
      'rt-paragraph',
      'rt-ordered-list-item',
      'rt-ordered-list-item',
      'rt-unordered-list-item'
    ]);
    expect(styles).toContain('counter-increment: cntrl-list');
    expect(styles).toContain('content: \'•\'');
  });

  it('draws a highlighted range on its colour, with an rgba fallback where oklch is not supported', () => {
    const [, styles] = converter.toHtml(text([{ text: 'Read on' }], [{ start: 0, end: 4, style: 'HIGHLIGHT', value: '#FFFF00' }]), layouts);
    expect(styles).toMatch(/\.s-0-4 \{\s*background-color: [^;]+;/);
    expect(styles).toContain('background-color: rgba(255, 255, 0, 1)');
  });

  it('leaves text without lists as it was', () => {
    const [content, styles] = converter.toHtml(text([{ text: 'Plain' }]), layouts);
    const { container } = render(<>{content}</>);
    expect(container.firstElementChild!.className).not.toContain('rt-paragraph');
    expect(styles).not.toContain('cntrl-list');
  });
});
