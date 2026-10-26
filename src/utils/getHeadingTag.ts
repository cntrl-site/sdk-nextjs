export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const HEADING_TAGS = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** The heading tag a text is drawn in, where its params name one: a rich text item's, or a text block's. */
export function getHeadingTag(element: { commonParams: object }): HeadingTag | undefined {
  const heading = (element.commonParams as { heading?: unknown }).heading;
  if (typeof heading !== 'string' || !HEADING_TAGS.has(heading)) return;
  return heading as HeadingTag;
}
