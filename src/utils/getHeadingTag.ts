import { RichTextItem } from '@cntrl-site/sdk';

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const HEADING_TAGS = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// `commonParams.heading` is optional and comes from the editor,
// so the value is validated instead of being trusted as a tag name
export function getHeadingTag(item: RichTextItem): HeadingTag | undefined {
  const heading = (item.commonParams as { heading?: unknown }).heading;
  if (typeof heading !== 'string' || !HEADING_TAGS.has(heading)) return;
  return heading as HeadingTag;
}
