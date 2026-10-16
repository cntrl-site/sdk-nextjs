import { CntrlColor } from '@cntrl-site/color';
import { Hyphens, StructuredBlockRichTextLayoutParams, StructuredBlockTextStyles } from '@cntrl-site/sdk';
import { getFontFamilyValue } from '../../utils/getFontFamilyValue';

/** A block's text styles as a CSS rule for `selector`, its lengths in viewport units as the block's own. */
export function textStylesRule(selector: string, styles: StructuredBlockTextStyles): string {
  const color = CntrlColor.parse(styles.color);
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
      color: ${color.fmt('oklch')};
    }
    @supports not (color: oklch(42% 0.3 90 / 1)) {
      ${selector} {
        color: ${color.fmt('rgba')};
      }
    }
  `;
}

/** The columns a text block flows in, the gap between them in viewport units, and whether its lines hyphenate. */
export function textColumnsRule(
  selector: string,
  { columns = 1, columnGap = 0, hyphens = Hyphens.None }: Pick<StructuredBlockRichTextLayoutParams, 'columns' | 'columnGap' | 'hyphens'>
): string {
  return `
    ${selector} {
      hyphens: ${hyphens};
      -webkit-hyphens: ${hyphens};
      ${columns > 1 ? `column-count: ${columns}; column-gap: ${columnGap * 100}vw; column-fill: balance;` : ''}
    }
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
