import { getLayoutMediaQuery, TLayout, TTypePresets } from '@cntrl-site/sdk';

export function generateTypePresetStyles(preset: TTypePresets, layouts: TLayout[]): string {
  const sorted = layouts.slice().sort((a, b) => a.startsWith - b.startsWith);
  return (`
    ${preset.presets.map(p => (`
.cntrl-preset-${p.id} {
  font-family: ${p.fontFamily};
  ${p.fontStyle.length > 0 ? `font-style: ${p.fontStyle};` : ''}
  font-weight: ${p.fontWeight};
}
  ${sorted.map(l => (`
${getLayoutMediaQuery(l.id, sorted)} {
  .cntrl-preset-${p.id} {
    font-size: ${p.layoutParams[l.id].fontSize * 100}vw;
    line-height: ${p.layoutParams[l.id].lineHeight * 100}vw;
    letter-spacing: ${p.layoutParams[l.id].letterSpacing * 100}vw;
    word-spacing: ${p.layoutParams[l.id].wordSpacing * 100}vw;
    color: ${p.layoutParams[l.id].color};
  }
}`)).join('\n')}`)).join('\n')}`);
}
