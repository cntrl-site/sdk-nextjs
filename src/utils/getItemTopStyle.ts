import { AnchorSide } from '@cntrl-site/sdk';

function getAnchorSideShift(anchorSide: AnchorSide, height?: number) {
  if (!height) return 0;
  switch (anchorSide) {
    case AnchorSide.Center:
      return height / 2;
    case AnchorSide.Bottom:
      return height;
    default:
      return 0;
  }
}

export function getPercentageBasedTopStyle(top: number, height?: number, anchorSide?: AnchorSide) {
  const defaultValue = `${top * 100}vw`;
  if (!anchorSide) return defaultValue;
  switch (anchorSide) {
    case AnchorSide.Top:
      return defaultValue;
    case AnchorSide.Center:
      return `calc(50% + ${top * 100}vw - ${getAnchorSideShift(anchorSide, height)}vh)`;
    case AnchorSide.Bottom:
      return `calc(100% + ${top * 100}vw - ${getAnchorSideShift(anchorSide, height)}vh)`;
  }
}

export function getItemTopStyle(top: number, anchorSide?: AnchorSide) {
  const defaultValue = `${top * 100}vw`;
  if (!anchorSide) return defaultValue;
  switch (anchorSide) {
    case AnchorSide.Top:
      return defaultValue;
    case AnchorSide.Center:
      return `calc(50% + ${top * 100}vw)`;
    case AnchorSide.Bottom:
      return `calc(100% + ${top * 100}vw)`;
  }
}
