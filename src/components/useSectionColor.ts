import { useCurrentLayout } from '../common/useCurrentLayout';
import { useMemo } from 'react';
import { CntrlColor } from '@cntrl-site/sdk';

type LayoutIdentifier = string;
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

export const useSectionColor = (colorData: Record<LayoutIdentifier, string | null>): CntrlColor => {
  const layoutId = useCurrentLayout();
   return useMemo(() => {
     const layoutColor = colorData[layoutId];
     return CntrlColor.parse(
       !layoutColor
         ? DEFAULT_COLOR
         : layoutColor
     );
   }, []);
};
