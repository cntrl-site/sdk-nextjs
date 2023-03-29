import { useCurrentLayout } from '../common/useCurrentLayout';
import { useMemo } from 'react';
import { CntrlColor } from '@cntrl-site/sdk';

type LayoutIdentifier = string;
const DEFAULT_COLOR = 'transparent';

export const useSectionColor = (colorData: Record<LayoutIdentifier, string | null>): string => {
  const layoutId = useCurrentLayout();
   return useMemo(() => {
     const layoutColor = colorData[layoutId];
     return !layoutColor ? DEFAULT_COLOR : CntrlColor.parse(layoutColor).toCss();
   }, []);
};
