import { useCurrentLayout } from '../common/useCurrentLayout';
import { useEffect, useState } from 'react';
import { CntrlColor } from '@cntrl-site/sdk';

type LayoutIdentifier = string;
const DEFAULT_COLOR = 'transparent';

export const useSectionColor = (colorData: Record<LayoutIdentifier, string | null>): string => {
  const layoutId = useCurrentLayout();
  const [color, setColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    const layoutColor = colorData[layoutId];
    const color = !layoutColor ? DEFAULT_COLOR : CntrlColor.parse(layoutColor).toCss()
    setColor(color);
  }, [layoutId]);
  return color;
};
