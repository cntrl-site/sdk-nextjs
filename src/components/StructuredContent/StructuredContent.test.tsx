import { fireEvent, render } from '@testing-library/react';
import { Layout, Section, StructuredBlockType } from '@cntrl-site/sdk';
import { CntrlContext } from '../../provider/CntrlContext';
import { CntrlSdkContext } from '../../provider/CntrlSdkContext';
import { CustomItemRegistry } from '../../provider/CustomItemRegistry';
import { CustomSectionRegistry } from '../../provider/CustomSectionRegistry';
import { LayoutContext } from '../../provider/LayoutContext';
import { StructuredContent } from './StructuredContent';

// the styles each component writes, drawn where it is for the test to read them
jest.mock('styled-jsx/style', () => ({ __esModule: true, default: ({ children }: { children: string | string[] }) => <style>{children}</style> }));
jest.mock('@vimeo/player', () => jest.fn().mockImplementation(() => ({ on: jest.fn(), off: jest.fn(), play: jest.fn(), pause: jest.fn() })));

const layouts: Layout[] = [
  { id: 'desktop', title: 'Desktop', startsWith: 800, exemplary: 1440 },
  { id: 'mobile', title: 'Mobile', startsWith: 0, exemplary: 375 }
];

const textStyles = {
  typeFace: 'Arial',
  fontSize: 0.02,
  lineHeight: 0.03,
  letterSpacing: 0,
  wordSpacing: 0,
  fontWeight: 400,
  fontStyle: 'normal',
  fontVariant: 'normal',
  textTransform: 'none',
  verticalAlign: 'unset',
  textAlign: 'center',
  color: '#000000'
};

const onGrid = { zIndex: 1, paddingTop: 0.01, left: 0.35, width: 0.3, innerPaddingTop: 0.005, innerPaddingBottom: 0.006 };

function block(type: StructuredBlockType, id: string, commonParams: object, layoutParams: object, area: object = onGrid) {
  return {
    id,
    type,
    hidden: {},
    state: {},
    area: { desktop: area, mobile: area },
    layoutParams: { desktop: layoutParams, mobile: layoutParams },
    commonParams
  };
}

const paragraph = (text: string) => ({ text: `${text}\n`, blocks: [{ start: 0, end: text.length, type: 'unstyled', entities: [] }] });

const title = block(StructuredBlockType.RichText, 'title', paragraph('The title'), { ...textStyles, rangeStyles: [] });
const headerImage = block(StructuredBlockType.HeaderImage, 'key-image', { url: 'https://cdn.cntrl.site/key.jpg', altText: 'Key', caption: 'Under the key image' }, { opacity: 1 });
const text = block(StructuredBlockType.RichText, 'text', paragraph('Read the post'), {
  ...textStyles,
  columns: 2,
  columnGap: 0.01,
  hyphens: 'auto',
  rangeStyles: [{ start: 0, end: 4, style: 'FONTSIZE', value: '0.04' }]
});
const quote = block(StructuredBlockType.Quote, 'quote', { ...paragraph('A quote'), kind: 'boxed' }, {
  ...textStyles,
  rangeStyles: [],
  background: '#EEEEEE',
  boxPaddingTop: 0.02,
  boxPaddingRight: 0.03,
  boxPaddingBottom: 0.02,
  boxPaddingLeft: 0.01,
  boxRadius: 0.01
});
const date = block(StructuredBlockType.Date, 'date', { ...paragraph('23 Sep 2026'), date: '2026-09-23', format: 'D MMM YYYY' }, {
  ...textStyles,
  rangeStyles: [{ start: 3, end: 6, style: 'FONTWEIGHT', value: '700' }]
});
const gallery = block(StructuredBlockType.Image, 'gallery', {
  urls: ['https://cdn.cntrl.site/a.jpg', 'https://cdn.cntrl.site/b.jpg'],
  altText: 'Two views',
  caption: 'Seen from the hill'
}, { opacity: 0.8, captionStyles: { ...textStyles, fontSize: 0.01 } });
const video = block(StructuredBlockType.Video, 'video', { url: 'https://cdn.cntrl.site/clip.mp4', coverUrl: 'https://cdn.cntrl.site/cover.jpg' }, {
  play: 'on-click',
  muted: true,
  controls: false
});
const code = block(StructuredBlockType.Code, 'code', {
  code: 'const a = 1;',
  language: 'typescript',
  theme: 'dracula',
  lines: [[{ content: 'const', color: '#FF79C6', fontStyle: 2 }, { content: ' a = 1;', color: '#F8F8F2' }, { content: ' // gone', color: '#6272A4', fontStyle: 12 }]],
  colors: { background: '#282A36', foreground: '#F8F8F2' }
}, {});
const divider = block(StructuredBlockType.Divider, 'divider', {}, { color: '#C0C0C0' }, { ...onGrid, height: 0.001 });
const tableCells = {
  ...textStyles,
  cellPaddingTop: 0.005,
  cellPaddingBottom: 0.005,
  columns: [{ width: 0.6, paddingLeft: 0.01, paddingRight: 0.01 }, { width: 0.4, paddingLeft: 0.02, paddingRight: 0 }],
  borderColor: '#C0C0C0',
  headingBackground: '#EEEEEE',
  bodyBackground: '#F8F8F8'
};
const cell = (id: string, text: string, styles: object = {}) => ({ id, ...paragraph(text), styles: { desktop: [], mobile: [], ...styles } });
const bold = [{ start: 0, end: 4, style: 'FONTWEIGHT', value: '700' }];
function tableContent(ids: string) {
  return {
    header: [cell(`${ids}-h0`, 'Name', { desktop: bold, mobile: bold }), cell(`${ids}-h1`, 'Price')],
    rows: [[cell(`${ids}-r00`, 'Tea'), cell(`${ids}-r01`, '3')], [cell(`${ids}-r10`, 'Coffee'), cell(`${ids}-r11`, '4')]]
  };
}
const table = block(StructuredBlockType.Table, 'table', { kind: 'cells', ...tableContent('t') }, tableCells);
const vimeo = block(StructuredBlockType.VimeoEmbed, 'vimeo', {
  url: 'https://player.vimeo.com/video/1',
  coverUrl: null,
  ratioLock: true
}, { play: 'auto', controls: true, loop: true, muted: true, pictureInPicture: false, radius: 0.01, blur: 0, opacity: 1 });
const component = block(StructuredBlockType.Component, 'component', { componentId: 'unknown', content: [] }, { parameters: {}, opacity: 1, blur: 0 }, { zIndex: 1, alignment: 'left' });

const header = {
  id: 'header',
  type: StructuredBlockType.Header,
  hidden: {},
  state: {},
  area: { desktop: { zIndex: 2, paddingTop: 0.02 }, mobile: { zIndex: 2 } },
  commonParams: { title: 'title', subtitle: 'subtitle', date: 'header-date', image: 'key-image' },
  layoutParams: {
    desktop: { variant: 'A', order: ['image', 'title', 'subtitle', 'date'], hiddenElements: [], imageFit: 'cover', coverHeight: 0.8 },
    mobile: { variant: 'B', order: ['title', 'image', 'subtitle', 'date'], hiddenElements: ['image'], imageFit: 'original', coverHeight: 1 }
  }
};

const stack = [text, quote, date, gallery, video, code, table, divider, vimeo, component];

function section(withHeader: boolean) {
  return {
    id: 'content',
    items: [],
    position: {},
    minHeight: {},
    color: {},
    hidden: {},
    type: 'content-based',
    structuredContent: [title, headerImage, ...stack],
    structuredContentSettings: { paddingBottom: { desktop: 0.02, mobile: 0.02 }, defaultWidth: { desktop: 0.3, mobile: 0.8 } },
    ...(withHeader && { header })
  } as unknown as Section;
}

function draw(section: Section) {
  const sdk = new CntrlSdkContext(new CustomItemRegistry(), new CustomSectionRegistry());
  sdk.setLayouts(layouts);
  return render(
    <CntrlContext.Provider value={sdk}>
      <LayoutContext.Provider value="desktop">
        <StructuredContent section={section} />
      </LayoutContext.Provider>
    </CntrlContext.Provider>
  );
}

const css = () => [...document.body.querySelectorAll('style')].map(style => style.textContent).join('\n');

describe('StructuredContent', () => {
  it('draws every block of the stack in order', () => {
    const { container } = draw(section(false));
    const items = [...container.querySelectorAll('[class^="structured-block-item-"]')].map(item => item.className.replace('structured-block-item-', ''));
    expect(items).toEqual(['title', 'key-image', ...stack.map(block => block.id)]);
  });

  it('places a block drawn from a preset on the content grid, its inner paddings apart from the gap above it', () => {
    draw(section(false));
    expect(css()).toMatch(/\.structured-block-item-text \{[^}]*margin-top: 1vw;[^}]*left: 35vw;[^}]*width: 30vw;[^}]*padding-top: 0\.5vw;[^}]*padding-bottom: 0\.6vw;/);
    expect(css()).toMatch(/\.structured-block-item-component \{[^}]*align-self: flex-start;/);
  });

  it('draws a text block served as a heading in its tag, without the tag\'s own margins, and other text plainly', () => {
    const heading = block(StructuredBlockType.RichText, 'heading', { ...paragraph('The page'), heading: 'h1' }, { ...textStyles, rangeStyles: [] });
    const { container } = draw({ ...section(false), structuredContent: [heading, text] } as Section);
    expect(container.querySelector('.structured-text-heading')!.tagName).toBe('H1');
    expect(container.querySelector('.structured-text-text')!.tagName).toBe('DIV');
    expect(css()).toMatch(/\.structured-text-heading \{\s*margin: 0;/);
  });

  it('sets text in its styles, its ranges in viewport units', () => {
    const { container } = draw(section(false));
    expect(container.querySelector('.structured-text-text')!.textContent!.trim()).toBe('Read the post');
    expect(css()).toMatch(/\.structured-text-text \{[^}]*font-size: 2vw;[^}]*line-height: 3vw;/);
    expect(css()).toContain('font-size: 4vw');
  });

  it('flows a text block in its columns, the gap between them in viewport units, hyphenating as set; a quote keeps to its box', () => {
    draw(section(false));
    expect(css()).toMatch(/\.structured-text-text \{[^}]*hyphens: auto;[^}]*column-count: 2; column-gap: 1vw; column-fill: balance;/);
    expect(css()).not.toMatch(/\.structured-text-quote \{[^}]*column-count/);
    expect(css()).not.toMatch(/\.structured-text-quote \{[^}]*hyphens/);
  });

  it('draws a quote in its box and a date as the text it reads as', () => {
    const { container } = draw(section(false));
    expect(container.querySelector('.structured-quote-box-quote')!.textContent!.trim()).toBe('A quote');
    expect(css()).toMatch(/\.structured-quote-box-quote \{[^}]*padding: 2vw 3vw 2vw 1vw;[^}]*border-radius: 1vw;/);
    expect(container.querySelector('.structured-text-date')!.textContent!.trim()).toBe('23 Sep 2026');
  });

  it('draws a gallery\'s images side by side, its caption under them', () => {
    const { container } = draw(section(false));
    const images = [...container.querySelectorAll<HTMLImageElement>('.structured-gallery-image-gallery')];
    expect(images.map(image => image.alt)).toEqual(['Two views', 'Two views']);
    // equally wide until their own proportions are known
    expect(images.map(image => image.style.flexGrow)).toEqual(['0.5', '0.5']);
    expect(container.querySelector('.structured-caption-gallery')!.textContent).toBe('Seen from the hill');
  });

  it('draws no caption an image has switched off, nor one that says nothing', () => {
    const switchedOff = block(StructuredBlockType.Image, 'off', { urls: ['https://cdn.cntrl.site/a.jpg'], altText: '', caption: 'Kept for later', showCaption: false }, { opacity: 1 });
    const blank = block(StructuredBlockType.Image, 'blank', { urls: ['https://cdn.cntrl.site/b.jpg'], altText: '', caption: '  ' }, { opacity: 1 });
    const keyImage = { ...headerImage, commonParams: { ...headerImage.commonParams, showCaption: false } };
    const { container } = draw({ ...section(false), structuredContent: [switchedOff, blank, keyImage] } as Section);
    expect(container.querySelector('.structured-caption-off')).toBeNull();
    expect(container.querySelector('.structured-caption-blank')).toBeNull();
    expect(container.querySelector(`.structured-caption-${keyImage.id}`)).toBeNull();
    expect(container.querySelector('.structured-gallery-image-off')).not.toBeNull();
    expect(container.querySelector(`.structured-header-picture-${keyImage.id}`)).not.toBeNull();
  });

  it('fills a gallery\'s row whatever its images\' proportions, a lone portrait image as wide as the block', () => {
    const portrait = block(StructuredBlockType.Image, 'portrait', { urls: ['https://cdn.cntrl.site/p.jpg'], altText: '', caption: '' }, { opacity: 1 });
    const { container } = draw({ ...section(false), structuredContent: [portrait] } as Section);
    const image = container.querySelector<HTMLImageElement>('.structured-gallery-image-portrait')!;
    Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 300 }, naturalHeight: { value: 400 } });
    fireEvent.load(image);
    expect(image.style.flexGrow).toBe('1');
  });

  it('draws code coloured as it comes, in its theme\'s box', () => {
    const { container } = draw(section(false));
    const tokens = [...container.querySelectorAll<HTMLSpanElement>('.structured-code-text-code span')];
    expect(tokens.map(token => [token.textContent, token.style.color, token.style.fontWeight, token.style.textDecoration])).toEqual([
      ['const', 'rgb(255, 121, 198)', 'bold', ''],
      [' a = 1;', 'rgb(248, 248, 242)', '', ''],
      [' // gone', 'rgb(98, 114, 164)', '', 'underline line-through']
    ]);
    expect(css()).toContain('background: #282A36');
  });

  it('draws a table of cells: the heading over its rows, the cells set in its text styles, each column its share of the width and its own paddings', () => {
    const { container } = draw(section(false));
    expect([...container.querySelectorAll('.structured-table-table th')].map(cell => cell.textContent!.trim())).toEqual(['Name', 'Price']);
    expect([...container.querySelectorAll('.structured-table-table td')].map(cell => cell.textContent!.trim())).toEqual(['Tea', '3', 'Coffee', '4']);
    expect(container.querySelectorAll('.structured-table-table col')).toHaveLength(2);
    expect(css()).toMatch(/\.structured-table-table \{[^}]*font-size: 2vw;[^}]*text-align: center;/);
    expect(css()).toMatch(/\.structured-table-table th, \.structured-table-table td \{[^}]*padding-top: 0\.5vw;[^}]*padding-bottom: 0\.5vw;[^}]*border-width: /);
    expect(css()).toMatch(/\.structured-table-table col:nth-child\(1\) \{\s*width: 60%;/);
    expect(css()).toMatch(/\.structured-table-table th:nth-child\(2\), \.structured-table-table td:nth-child\(2\) \{\s*padding-left: 2vw;\s*padding-right: 0vw;/);
    expect(css()).toMatch(/\.structured-table-table th, \.structured-table-table td \{\s*border-color: oklch/);
    expect(css()).toMatch(/\.structured-table-heading-table \{\s*background-color: oklch/);
    expect(css()).toMatch(/\.structured-table-body-table \{\s*background-color: oklch/);
  });

  it('sets a cell\'s ranges in their styles, as a text block\'s, and draws a list in a cell with the list styles once', () => {
    const listed = block(StructuredBlockType.Table, 'listed', {
      kind: 'cells',
      header: [cell('l-h0', 'Steps')],
      rows: [[{
        id: 'l-r00',
        text: 'Boil\nPour\n',
        blocks: [{ start: 0, end: 4, type: 'ordered-list-item', entities: [] }, { start: 5, end: 9, type: 'ordered-list-item', entities: [] }],
        styles: { desktop: [], mobile: [] }
      }]]
    }, tableCells);
    const { container } = draw({ ...section(false), structuredContent: [table, listed] } as Section);
    const heading = container.querySelector('.structured-table-table th')!;
    expect(heading.textContent!.trim()).toBe('Name');
    expect(heading.querySelector('[class*="rt_table-t-h0"]')).not.toBeNull();
    expect(css()).toMatch(/rt_table-t-h0[^{]*\{[^}]*font-weight: 700/);
    expect([...container.querySelectorAll('.structured-table-listed td .rt-ordered-list-item')].map(item => item.textContent!.trim())).toEqual(['Boil', 'Pour']);
    expect(css().match(/counter\(cntrl-list\) '\.'/g)).toHaveLength(1);
  });

  it('draws a table of rows with every row plain and the two fills alternating from the first, and one of lines with a line between the rows only', () => {
    const rows = block(StructuredBlockType.Table, 'zebra', { kind: 'rows', ...tableContent('z') }, tableCells);
    const lines = block(StructuredBlockType.Table, 'ruled', { kind: 'lines', ...tableContent('r') }, tableCells);
    const { container } = draw({ ...section(false), structuredContent: [rows, lines] } as Section);
    expect(container.querySelectorAll('.structured-table-zebra th')).toHaveLength(0);
    expect(container.querySelectorAll('.structured-table-zebra td')).toHaveLength(6);
    expect(css()).toMatch(/\.structured-table-zebra thead tr, \.structured-table-zebra tbody tr:nth-child\(even\) \{\s*background-color: oklch/);
    expect(css()).toMatch(/\.structured-table-zebra tbody tr:nth-child\(odd\) \{\s*background-color: oklch/);
    expect(css()).not.toMatch(/\.structured-table-heading-zebra \{/);

    expect(container.querySelectorAll('.structured-table-ruled th')).toHaveLength(2);
    expect(css()).toMatch(/\.structured-table-ruled th, \.structured-table-ruled td \{[^}]*border-width: 0;/);
    expect(css()).toMatch(/\.structured-table-ruled tbody > tr > th, \.structured-table-ruled tbody > tr > td \{\s*border-top-width: /);
    expect(css()).toMatch(/\.structured-table-heading-ruled \{\s*background-color: oklch/);
  });

  it('covers a video played on click until it plays, and fetches no more than its metadata until then', () => {
    const { container } = draw(section(false));
    expect(container.querySelector('video')!.getAttribute('src')).toBe('https://cdn.cntrl.site/clip.mp4');
    expect(container.querySelector('video')!.getAttribute('preload')).toBe('metadata');
    expect(container.querySelector('.structured-video-cover-video')).not.toBeNull();
    expect(container.querySelector('.structured-video-overlay-video')).not.toBeNull();
  });

  it('writes one column out too, so a smaller layout\'s columns stop at the layout set to one', () => {
    const plain = block(StructuredBlockType.RichText, 'plain', paragraph('Plain'), { ...textStyles, rangeStyles: [] });
    draw({ ...section(false), structuredContent: [plain] } as Section);
    expect(css()).toMatch(/\.structured-text-plain \{[^}]*column-count: auto; column-gap: normal;/);
  });

  it('skips a block of a type it does not know, and an image the API could not resolve', () => {
    const later = { ...code, id: 'later', type: 'chart-block' };
    const missing = block(StructuredBlockType.Image, 'missing', { urls: ['https://cdn.cntrl.site/a.jpg', ''], altText: '' }, { opacity: 1 });
    const { container } = draw({ ...section(false), structuredContent: [text, later, missing] } as Section);
    const skipped = container.querySelector('.structured-block-item-later')!;
    expect([...skipped.children].filter(child => child.tagName !== 'STYLE')).toHaveLength(0);
    expect(container.querySelectorAll('.structured-gallery-image-missing')).toHaveLength(1);
  });

  it('draws the header first, with its elements left out of the stack', () => {
    const { container } = draw(section(true));
    const content = container.firstElementChild!;
    expect(content.firstElementChild!.className).toBe('structured-header-header');
    expect(container.querySelectorAll('.structured-text-title')).toHaveLength(1);
    const items = [...container.querySelectorAll('[class^="structured-block-item-"]')].map(item => item.className.replace('structured-block-item-', ''));
    expect(items).toEqual(stack.map(block => block.id));
  });

  it('arranges the header by the variant of each layout', () => {
    draw(section(true));
    // desktop, variant A: the key image covers the header, the text on its bottom edge, no caption
    expect(css()).toMatch(/@media \(min-width: 800px\) \{[\s\S]*\.structured-header-header \{[^}]*height: 80svh;/);
    expect(css()).toMatch(/\.structured-header-stack-header \{[^}]*position: absolute;/);
    expect(css()).toMatch(/\.structured-header-element-key-image \.structured-caption-key-image \{\s*display: none;/);
    // mobile, variant B: the elements flow in its order, the image hidden there; the caption and the
    // cover sizing written back, so they end where the variant does
    expect(css()).toMatch(/\.structured-header-stack-header \{\s*display: contents;/);
    expect(css()).toMatch(/\.structured-header-element-key-image \{\s*display: none;/);
    expect(css()).toMatch(/\.structured-header-element-key-image \.structured-caption-key-image \{\s*display: block;/);
    expect(css()).toMatch(/\.structured-header-element-key-image \.structured-header-picture-key-image \{\s*object-fit: fill;/);
  });

  it('keeps the gap above the header a block of the stack has, on the layout that sets one', () => {
    draw(section(true));
    expect(css()).toMatch(/@media \(min-width: 800px\) \{[\s\S]*\.structured-header-header \{[^}]*margin-top: 2vw;/);
    expect(css()).toMatch(/\.structured-header-header \{[^}]*margin-top: 0;/);
  });

  it('puts an element an older header never ordered last', () => {
    const unordered = { ...header, layoutParams: { ...header.layoutParams, mobile: { ...header.layoutParams.mobile, order: ['image', 'subtitle', 'date'] } } };
    draw({ ...section(true), header: unordered } as unknown as Section);
    expect(css()).toMatch(/\.structured-header-element-title \{[^}]*order: 3;/);
  });
});
