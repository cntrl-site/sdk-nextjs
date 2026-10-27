import { CntrlColor } from '@cntrl-site/color';
import { Hyphens, StructuredBlockBoxParams, StructuredBlockRichTextLayoutParams, StructuredBlockTextStyles } from '@cntrl-site/sdk';
import { getFontFamilyValue } from '../../utils/getFontFamilyValue';

/** A block's text styles as a CSS rule for `selector`, its lengths in viewport units as the block's own. */
export function textStylesRule(selector: string, styles: StructuredBlockTextStyles): string {
  return `
    ${selector} {
      font-family: ${getFontFamilyValue(styles.typeFace)};
      font-size: ${styles.fontSize * 100}vw;
      line-height: ${styles.lineHeight * 100}vw;
      letter-spacing: ${styles.letterSpacing * 100}vw;
      word-spacing: ${styles.wordSpacing * 100}vw;
      font-weight: ${styles.fontWeight};
      font-style: ${styles.fontStyle || 'normal'};
      font-variant: ${styles.fontVariant};
      text-transform: ${styles.textTransform};
      vertical-align: ${styles.verticalAlign};
      text-align: ${styles.textAlign};
    }
    ${colorRule(selector, 'color', styles.color)}
  `;
}

/**
 * The columns a text block flows in, the gap between them in viewport units, and whether its lines
 * hyphenate. One column is written out too: the layouts' media queries stack upward, so a smaller
 * layout's columns would otherwise carry into a larger layout set to one.
 */
export function textColumnsRule(
  selector: string,
  { columns = 1, columnGap = 0, hyphens = Hyphens.None }: Pick<StructuredBlockRichTextLayoutParams, 'columns' | 'columnGap' | 'hyphens'>
): string {
  return `
    ${selector} {
      hyphens: ${hyphens};
      -webkit-hyphens: ${hyphens};
      ${columns > 1 ? `column-count: ${columns}; column-gap: ${columnGap * 100}vw; column-fill: balance;` : 'column-count: auto; column-gap: normal;'}
    }
  `;
}

/**
 * The box a quote's text or a table is drawn in, as a CSS rule for `selector`: padded inside, its
 * sides grown out past the columns the block is placed on by as much as they pad it, so what it
 * holds stays on them; rounded, and filled where it has a fill.
 */
export function boxRule(selector: string, box: StructuredBlockBoxParams): string {
  const vw = (value: number | undefined) => `${(value ?? 0) * 100}vw`;
  return `
    ${selector} {
      padding: ${[box.boxPaddingTop, box.boxPaddingRight, box.boxPaddingBottom, box.boxPaddingLeft].map(vw).join(' ')};
      margin: 0 -${vw(box.boxPaddingRight)} 0 -${vw(box.boxPaddingLeft)};
      border-radius: ${vw(box.boxRadius)};
      background-color: transparent;
    }
    ${box.background ? colorRule(selector, 'background-color', box.background) : ''}
  `;
}

/** A colour of the palette as CSS for `property`, with a fallback where oklch is not supported. */
export function colorRule(selector: string, property: string, value: string): string {
  const color = CntrlColor.parse(value);
  return `
    ${selector} {
      ${property}: ${color.fmt('oklch')};
    }
    @supports not (color: oklch(42% 0.3 90 / 1)) {
      ${selector} {
        ${property}: ${color.fmt('rgba')};
      }
    }
  `;
}
