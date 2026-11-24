/**
 * Axes the editor leaves out: fonts swap to separate italic glyphs part-way along `ital` instead of
 * blending, so italic comes from the font style. Values stored before it was left out don't render.
 */
const EXCLUDED_AXES = ['ital'];

/** An OpenType axis tag: one to four printable ASCII characters, none that could end the CSS string. */
const AXIS_TAG = /^[\x20-\x7E]{1,4}$/;

function isRenderableTag(tag: string): boolean {
  return AXIS_TAG.test(tag) && !tag.includes('"') && !tag.includes('\\') && !EXCLUDED_AXES.includes(tag);
}

/**
 * CSS `font-variation-settings` for variable font axis values, e.g. `"wght" 650, "wdth" 80`, as the
 * editor renders them. Axes left out keep the browser's own value (weight, style, optical size from
 * font-size), so only set values go in; `undefined` when there are none.
 */
export function getFontVariationSettings(values: Record<string, number> | undefined): string | undefined {
  if (!values) return undefined;
  // keys aren't validated on fetch, and the value goes into a <style> block: skip any that aren't tags
  const entries = Object.entries(values).filter(([tag, value]) => isRenderableTag(tag) && Number.isFinite(value));
  if (!entries.length) return undefined;
  // a tag is exactly four characters; fonts may store padded ones such as 'XTR '
  return entries.map(([tag, value]) => `"${tag.padEnd(4, ' ')}" ${round(value)}`).join(', ');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
