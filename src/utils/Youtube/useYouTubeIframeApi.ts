import { useEffect, useState } from 'react';
import { YT } from './YoutubeIframeApi';
import { YouTubeIframeApiLoader } from './YouTubeIframeApiLoader';

const loader = YouTubeIframeApiLoader.create();

export function useYouTubeIframeApi(): YT | undefined {
  const [YT, setYT] = useState<YT | undefined>(undefined);

  useEffect(() => {
    loader.getApi().then(YT => setYT(YT));
  }, []);

  return YT;
}
