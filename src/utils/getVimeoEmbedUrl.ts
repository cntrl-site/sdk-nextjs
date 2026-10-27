import { VimeoEmbedItem } from '@cntrl-site/sdk';

/** The player's url with how the layout plays the video, and none of Vimeo's own title, byline or portrait. */
export function getVimeoEmbedUrl(url: string, layoutParams: VimeoEmbedItem['layoutParams'][string]): string {
  const validURL = new URL(url);
  validURL.searchParams.append('controls', String(layoutParams.controls));
  validURL.searchParams.append('autoplay', String(layoutParams.play === 'auto'));
  validURL.searchParams.append('muted', String(layoutParams.muted));
  validURL.searchParams.append('loop', String(layoutParams.loop));
  validURL.searchParams.append('pip', String(layoutParams.pictureInPicture));
  validURL.searchParams.append('title', '0');
  validURL.searchParams.append('byline', '0');
  validURL.searchParams.append('portrait', '0');
  validURL.searchParams.append('autopause', 'false');
  return validURL.href;
}
