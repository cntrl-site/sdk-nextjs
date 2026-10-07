import { FontStyle, KernCompensator, RunBreaks } from './KernCompensator';

const arial: FontStyle = {
  fontFamily: 'Arial',
  fontSize: '16px',
  fontWeight: '400',
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontStretch: '100%',
  fontFeatureSettings: 'normal',
  letterSpacing: 'normal',
  wordSpacing: '0px',
  textTransform: 'none'
};

const pairs: Record<string, number> = { WA: -0.037, AV: -0.074 };
// Chrome and WebKit: a margin at the edge breaks the run on its own
const marginBreaks: RunBreaks = { margin: true, zeroToSpacing: true, spacingToSpacing: true };
// an engine that keeps a pair across a margin and between two spaced sides
const onlySpacingBreaks: RunBreaks = { margin: false, zeroToSpacing: true, spacingToSpacing: false };

function render(html: string, styles: Record<string, Partial<FontStyle>>, runBreaks = marginBreaks) {
  const root = document.createElement('div');
  root.innerHTML = html;
  const measurePair = jest.fn((_font: FontStyle, a: string, b: string) => pairs[a + b] ?? 0);
  const compensator = new KernCompensator({
    measurePair,
    getStyle: (element) => ({ ...arial, ...styles[(element as HTMLElement).dataset.leaf ?? ''] }),
    getRunBreaks: () => runBreaks
  });
  compensator.apply(root);
  const margins = () => Array.from(root.querySelectorAll('span')).map((span) => [span.style.marginLeft, span.style.marginRight]);
  return { root, compensator, measurePair, margins };
}

describe('KernCompensator', () => {
  beforeAll(() => {
    // jsdom has no layout; every character sits on one line
    Range.prototype.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
  });

  it('puts the pair back as an em margin on the trailing side of the span before the edge', () => {
    const { root, margins } = render(
      '<span data-leaf="w">W</span><span data-leaf="a">A</span>',
      { w: { letterSpacing: '1px' } }
    );
    expect(margins()).toEqual([['', '-0.03700em'], ['', '']]);
    expect(root.innerHTML).not.toContain('font-kerning');
  });

  it('opens the span after the edge instead when the text before it is not last in its own parent', () => {
    const { margins } = render(
      '<span data-leaf="x">W<span data-leaf="a">A</span></span>',
      { a: { letterSpacing: '1px' } }
    );
    expect(margins()).toEqual([['', ''], ['-0.03700em', '']]);
  });

  it('keeps the margin on an edge with equal spacing where a margin breaks the run by itself', () => {
    const { margins } = render('<span data-leaf="w">W</span><span data-leaf="a">A</span>', {});
    expect(margins()).toEqual([['', '-0.03700em'], ['', '']]);
  });

  it('leaves edges the browser kerns itself alone where only a spacing change breaks the run', () => {
    const plain = render('<span data-leaf="w">W</span><span data-leaf="a">A</span>', {}, onlySpacingBreaks);
    expect(plain.margins()).toEqual([['', ''], ['', '']]);
    expect(plain.measurePair).not.toHaveBeenCalled();
    const spaced = render(
      '<span data-leaf="w">W</span><span data-leaf="a">A</span>',
      { w: { letterSpacing: '1px' }, a: { letterSpacing: '2px' } },
      onlySpacingBreaks
    );
    expect(spaced.margins()).toEqual([['', ''], ['', '']]);
    const unspaced = render(
      '<span data-leaf="w">W</span><span data-leaf="a">A</span>',
      { w: { letterSpacing: '1px' } },
      onlySpacingBreaks
    );
    expect(unspaced.margins()).toEqual([['', '-0.03700em'], ['', '']]);
  });

  it('leaves different fonts alone, as no pair exists between them', () => {
    const { margins } = render(
      '<span data-leaf="w">W</span><span data-leaf="a">A</span>',
      { w: { letterSpacing: '1px', fontWeight: '700' } }
    );
    expect(margins()).toEqual([['', ''], ['', '']]);
  });

  it('skips pairs with whitespace and measures the transformed glyphs', () => {
    const { margins, measurePair } = render(
      '<span data-leaf="w">w </span><span data-leaf="a">a</span><span data-leaf="v">v</span>',
      { w: { textTransform: 'uppercase' }, a: { textTransform: 'uppercase' }, v: { textTransform: 'uppercase' } }
    );
    expect(measurePair).toHaveBeenCalledTimes(1);
    expect(measurePair).toHaveBeenCalledWith(expect.anything(), 'A', 'V');
    expect(margins()).toEqual([['', ''], ['', '-0.07400em'], ['', '']]);
  });

  it('clears a margin whose pair is gone when run again', () => {
    const styles: Record<string, Partial<FontStyle>> = {};
    const { root, compensator, margins } = render('<span data-leaf="w">W</span><span data-leaf="a">A</span>', styles);
    expect(margins()).toEqual([['', '-0.03700em'], ['', '']]);
    styles.a = { fontWeight: '700' };
    compensator.apply(root);
    expect(margins()).toEqual([['', ''], ['', '']]);
  });
});
