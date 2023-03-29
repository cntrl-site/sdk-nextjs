import { getLayoutMediaQuery, TLayout, TTypePresets, CntrlColor } from '@cntrl-site/sdk';

const reEmptyLines = /^\s*\n/gm;

export function generateTypePresetStyles(preset: TTypePresets, layouts: TLayout[]): string {
  const sorted = layouts.slice().sort((a, b) => a.startsWith - b.startsWith);
  const stylesStr = (`
    ${preset.presets.map(p => (`
.cntrl-preset-${p.id} {
  font-family: ${p.fontFamily};
  ${p.fontStyle.length > 0 ? `font-style: ${p.fontStyle};` : ''}
  font-weight: ${p.fontWeight};
}
  ${sorted.map(l => (`
${getLayoutMediaQuery(l.id, sorted)} {
  .cntrl-preset-${p.id} {
    font-size: ${p.fontSize / l.exemplary * 100}vw;
    line-height: ${p.lineHeight / l.exemplary * 100}vw;
    letter-spacing: ${p.letterSpacing / l.exemplary * 100}vw;
    word-spacing: ${p.wordSpacing / l.exemplary * 100}vw;
    color: ${CntrlColor.parse(p.color).toCss()};
  }
}`)).join('\n')}`)).join('\n')}`);
  return stylesStr.replace(reEmptyLines, '');
}
