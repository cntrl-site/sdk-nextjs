import { useEffect } from 'react';
import { KernCompensator } from './KernCompensator';

/**
 * Keeps the kerning pairs of the rich text under `root` compensated while its content, its
 * styles, the active layout or the loaded fonts change.
 */
export function useKernCompensation(root: HTMLElement | null): void {
  useEffect(() => {
    if (!root) return;
    const compensator = new KernCompensator();
    let observer: MutationObserver;
    const run = () => {
      compensator.apply(root);
      // the margins just written are mutations of our own
      observer.takeRecords();
    };
    observer = new MutationObserver(run);
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };
    window.addEventListener('resize', onResize);
    document.fonts?.addEventListener('loadingdone', run);
    run();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      document.fonts?.removeEventListener('loadingdone', run);
    };
  }, [root]);
}
