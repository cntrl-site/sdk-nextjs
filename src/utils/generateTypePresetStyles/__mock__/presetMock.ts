import { AllowedTags, TTypePresets } from '@cntrl-site/sdk';

const layoutParams = {
  'desktop': {
    fontSize: 0.011111,
    lineHeight: 0.013888,
    wordSpacing: 0.0006944,
    letterSpacing: 0.0006944,
    color: 'rgba(0, 0, 0, 1)'
  },
  'tablet': {
    fontSize: 0.02604,
    lineHeight: 0.03125,
    wordSpacing: 0,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 1)'
  },
  'mobile': {
    fontSize: 0.053333,
    lineHeight: 0.064,
    wordSpacing: 0.008,
    letterSpacing: 0.008,
    color: 'rgba(0, 0, 0, 1)'
  }
};

export const presetMock: TTypePresets = {
  id: 'presetId',
  presets: [
    {
      id: 'heading01',
      fontFamily: 'Aeonik',
      fontWeight: '400',
      fontStyle: '',
      name: 'Heading',
      tag: AllowedTags.h1,
      layoutParams
    },
    {
      id: 'heading02',
      fontFamily: 'Aeonik',
      fontWeight: '400',
      fontStyle: 'italic',
      name: 'Heading',
      tag: AllowedTags.h1,
      layoutParams
    }
  ]
};
