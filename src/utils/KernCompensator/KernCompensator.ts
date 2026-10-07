export type FontStyle = Pick<
  CSSStyleDeclaration,
  'fontFamily' | 'fontSize' | 'fontWeight' | 'fontStyle' | 'fontVariant' | 'fontStretch'
  | 'fontFeatureSettings' | 'letterSpacing' | 'wordSpacing' | 'textTransform'
>;

/**
 * Which changes between two neighbours make this browser shape them apart: a margin on the edge,
 * a letter-spacing change between an unspaced and a spaced side, and one between two differently
 * spaced sides.
 */
export interface RunBreaks {
  margin: boolean;
  zeroToSpacing: boolean;
  spacingToSpacing: boolean;
}

export interface KernCompensatorDeps {
  measurePair: (font: FontStyle, prev: string, next: string) => number;
  getStyle: (element: Element) => FontStyle;
  getRunBreaks: () => RunBreaks;
}

const NO_PAIR = /\s/;
const MEASURE_SIZE = 100;
const EM_PRECISION = 5;

/**
 * Puts a font's kerning pairs back where an element edge breaks them.
 *
 * A browser shapes a span as a run of its own once its letter- or word-spacing differs from its
 * neighbour's, and the font's kerning pair across that edge is lost: the next glyph jumps by the
 * pair's value the moment an override leaves the inherited spacing. The lost pair is measured
 * from the same font and put back as an em margin at the edge, so an override only adds its own
 * spacing on top of the natural text.
 *
 * The margin stays while the edge exists, whatever the spacing: a margin breaks the run too, and
 * a run broken then re-joined is not reshaped by Chrome until something else lays the text out
 * again, so an edge is never handed back to the browser's own kerning. The editor applies the same
 * compensation.
 */
export class KernCompensator {
  private readonly pairs = new Map<string, number>();
  private readonly deps: KernCompensatorDeps;

  constructor(deps: Partial<KernCompensatorDeps> = {}) {
    this.deps = {
      measurePair: measureWithCanvas,
      getStyle: (element) => getComputedStyle(element),
      getRunBreaks: probeRunBreaks,
      ...deps
    };
  }

  apply(root: HTMLElement): void {
    const texts = getTextNodes(root);
    const margins = new Map<HTMLElement, { left?: string; right?: string }>();
    for (let i = 1; i < texts.length; i += 1) {
      const prev = texts[i - 1];
      const next = texts[i];
      if (prev.parentElement === next.parentElement) continue;
      const prevStyle = this.deps.getStyle(prev.parentElement!);
      const nextStyle = this.deps.getStyle(next.parentElement!);
      if (!isSameFont(prevStyle, nextStyle) || !this.breaksRun(prevStyle, nextStyle)) continue;
      const a = transform(lastCodePoint(prev.data), prevStyle.textTransform);
      const b = transform(firstCodePoint(next.data), nextStyle.textTransform);
      if (!a || !b || NO_PAIR.test(a) || NO_PAIR.test(b) || !isSameLine(prev, next)) continue;
      const em = this.pair(nextStyle, a, b);
      if (em === 0) continue;
      const margin = `${em.toFixed(EM_PRECISION)}em`;
      if (isFirstTextOf(next)) {
        margins.set(next.parentElement!, { ...margins.get(next.parentElement!), left: margin });
      } else {
        margins.set(prev.parentElement!, { ...margins.get(prev.parentElement!), right: margin });
      }
    }
    for (const text of texts) {
      const element = text.parentElement!;
      const { left = '', right = '' } = margins.get(element) ?? {};
      setStyle(element, 'margin-left', left);
      setStyle(element, 'margin-right', right);
    }
  }

  private breaksRun(a: FontStyle, b: FontStyle): boolean {
    const breaks = this.deps.getRunBreaks();
    if (breaks.margin) return true;
    if (a.letterSpacing !== b.letterSpacing) {
      return isZero(a.letterSpacing) !== isZero(b.letterSpacing) ? breaks.zeroToSpacing : breaks.spacingToSpacing;
    }
    return a.wordSpacing !== b.wordSpacing;
  }

  private pair(font: FontStyle, a: string, b: string): number {
    const key = [font.fontFamily, font.fontWeight, font.fontStyle, font.fontVariant, font.fontStretch, font.fontFeatureSettings, a, b].join('|');
    let em = this.pairs.get(key);
    if (em === undefined) {
      em = this.deps.measurePair(font, a, b);
      if (Math.abs(em) < 10 ** -EM_PRECISION) em = 0;
      this.pairs.set(key, em);
    }
    return em;
  }
}

let context: CanvasRenderingContext2D | null | undefined;

function measureWithCanvas(font: FontStyle, a: string, b: string): number {
  context ??= document.createElement('canvas').getContext('2d');
  if (!context) return 0;
  const variant = font.fontVariant === 'small-caps' ? 'small-caps' : 'normal';
  context.font = `${font.fontStyle} ${variant} ${font.fontWeight} ${MEASURE_SIZE}px ${font.fontFamily}`;
  if ('fontKerning' in context) context.fontKerning = 'normal';
  const width = (text: string) => context!.measureText(text).width;
  return (width(a + b) - width(a) - width(b)) / MEASURE_SIZE;
}

let runBreaks: RunBreaks | undefined;

// Lays a kerned pair out in a hidden box, once, to see which changes make this browser shape the
// neighbours apart. A font without the W/A pair cannot tell, and then every change is taken to,
// as in Chrome and WebKit.
function probeRunBreaks(): RunBreaks {
  if (runBreaks) return runBreaks;
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;top:0;left:0;visibility:hidden;white-space:pre;'
    + 'font:100px Arial,Helvetica,sans-serif;letter-spacing:0;font-kerning:normal';
  document.body.appendChild(host);
  const leftOfA = (html: string): number => {
    host.innerHTML = html;
    const texts = getTextNodes(host);
    const text = texts[texts.length - 1];
    const offset = text.data.indexOf('A');
    const range = document.createRange();
    range.setStart(text, offset);
    range.setEnd(text, offset + 1);
    return range.getBoundingClientRect().left - host.getBoundingClientRect().left;
  };
  const kerned = leftOfA('<span>WA</span>');
  const unkerned = leftOfA('<span style="font-kerning:none">WA</span>');
  const keepsPair = (html: string, offset: number) => {
    const left = leftOfA(html) - offset;
    return Math.abs(left - kerned) < Math.abs(left - unkerned);
  };
  runBreaks = Math.abs(kerned - unkerned) < 0.5
    ? { margin: true, zeroToSpacing: true, spacingToSpacing: true }
    : {
        margin: !keepsPair('<span style="margin-right:0.5px">W</span><span>A</span>', 0.5),
        zeroToSpacing: !keepsPair('<span style="letter-spacing:0.5px">W</span><span>A</span>', 0.5),
        spacingToSpacing: !keepsPair('<span style="letter-spacing:0.5px">W</span><span style="letter-spacing:1px">A</span>', 0.5)
      };
  host.remove();
  return runBreaks;
}

function setStyle(element: HTMLElement, property: string, value: string): void {
  if (element.style.getPropertyValue(property) === value) return;
  if (value) {
    element.style.setProperty(property, value);
  } else {
    element.style.removeProperty(property);
  }
}

function getTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (node.parentElement && (node as Text).data.length > 0) texts.push(node as Text);
    node = walker.nextNode();
  }
  return texts;
}

function isSameFont(a: FontStyle, b: FontStyle): boolean {
  return a.fontFamily === b.fontFamily
    && a.fontSize === b.fontSize
    && a.fontWeight === b.fontWeight
    && a.fontStyle === b.fontStyle
    && a.fontVariant === b.fontVariant
    && a.fontStretch === b.fontStretch
    && a.fontFeatureSettings === b.fontFeatureSettings;
}

function isZero(spacing: string): boolean {
  return spacing === 'normal' || Number.parseFloat(spacing) === 0;
}

function isSameLine(prev: Text, next: Text): boolean {
  const a = document.createRange();
  a.setStart(prev, prev.data.length - 1);
  a.setEnd(prev, prev.data.length);
  const b = document.createRange();
  b.setStart(next, 0);
  b.setEnd(next, 1);
  return Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top) < 1;
}

function isFirstTextOf(text: Text): boolean {
  const walker = document.createTreeWalker(text.parentElement!, NodeFilter.SHOW_TEXT);
  return walker.nextNode() === text;
}

function firstCodePoint(text: string): string {
  const code = text.codePointAt(0);
  return code === undefined ? '' : String.fromCodePoint(code);
}

function lastCodePoint(text: string): string {
  const last = text.charCodeAt(text.length - 1);
  const isLowSurrogate = last >= 0xDC00 && last <= 0xDFFF;
  const code = text.codePointAt(isLowSurrogate && text.length > 1 ? text.length - 2 : text.length - 1);
  return code === undefined ? '' : String.fromCodePoint(code);
}

function transform(char: string, textTransform: string): string {
  switch (textTransform) {
    case 'uppercase': return char.toUpperCase();
    case 'lowercase': return char.toLowerCase();
    default: return char;
  }
}
