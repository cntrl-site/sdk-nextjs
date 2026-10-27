/**
 * The box an embedded player fills: as tall as its block where the block has a height of its own,
 * else at a video's 16:9, with the cover and the click catcher laid over the player.
 */
export function embedFrameStyles(blockId: string): string {
  return `
    .structured-embed-${blockId} {
      position: relative;
      width: 100%;
    }
    .structured-embed-frame-${blockId} {
      display: block;
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
    }
    .structured-embed-cover-${blockId},
    .structured-embed-overlay-${blockId} {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      z-index: 1;
    }
    .structured-embed-cover-${blockId} {
      object-fit: cover;
    }
  `;
}
