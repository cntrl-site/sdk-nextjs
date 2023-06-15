import { useContext } from 'react';
import { CntrlContext } from '../provider/CntrlContext';
import { TLayout, TSectionHeight } from '@cntrl-site/sdk';
import { getSectionHeight } from './Section';

export const useSectionHeightData = (sectionId: string): Record<string, string> => {
  const sectionHeightContext = useContext(CntrlContext);
  const layouts = sectionHeightContext.layouts;
  const sectionHeightData = sectionHeightContext.getSectionHeightData(sectionId);
  return sectionHeightData ? getSectionHeightMap(sectionHeightData) : getDefaultHeightData(layouts);
};

export function getSectionHeightMap(sectionHeight: Record<string, TSectionHeight>): Record<string, string> {
  return Object.fromEntries(Object.entries(sectionHeight).map(([sectionId, heightData]) => [sectionId, getSectionHeight(heightData)]));
}

function getDefaultHeightData(layouts: TLayout[]) {
  return layouts.reduce((acc, layout) => ({...acc, [layout.id]: '0'}), {});
}
