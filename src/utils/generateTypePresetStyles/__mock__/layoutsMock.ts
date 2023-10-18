import { TLayout } from '@cntrl-site/sdk';

const sampleGrid = {
  columnsAmount: 0,
  beatHeight: 0,
  beatMultiplier: 1,
  maxWidth: 0,
  columnWidth: 0.01,
  gutterWidth: 0.001
};

export const layoutsMock: TLayout[] = [
  {
    id: 'tablet',
    exemplary: 768,
    startsWith: 768,
    title: 'Tablet',
    icon: 'any',
    grid: sampleGrid,
    disabled: false,
    locked: false
  },
  {
    id: 'desktop',
    exemplary: 1440,
    startsWith: 1024,
    title: 'Desktop',
    icon: 'any',
    grid: sampleGrid,
    disabled: false,
    locked: false
  },
  {
    id: 'mobile',
    exemplary: 375,
    startsWith: 0,
    title: 'Mobile',
    icon: 'any',
    grid: sampleGrid,
    disabled: false,
    locked: false
  }
];
