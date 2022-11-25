export function getYoutubeId(url: URL): string | null | undefined {
  if (!url) return;
  if (url.hostname === 'youtu.be') {
    return url.pathname.replace('/', '');
  }
  if (url.hostname === 'www.youtube.com') {
    const searchParams = new URLSearchParams(url.search);
    return searchParams.get('v');
  }
};
