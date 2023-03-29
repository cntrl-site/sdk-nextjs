import { TTypePresets, TypePresetStatus } from '@cntrl-site/sdk';

export const presetMock: TTypePresets = {
  id: 'presetId',
  presets: [
    {
      id: 'heading01',
      fontFamily: 'Aeonik',
      fontWeight: '400',
      fontStyle: '',
      name: 'Heading',
      fontSize: 24,
      lineHeight: 36,
      wordSpacing: 1,
      letterSpacing: 1,
      color: 'rgba(0, 0, 0, 1)',
      status: TypePresetStatus.Active
    },
    {
      id: 'heading02',
      fontFamily: 'Aeonik',
      fontWeight: '400',
      fontStyle: 'italic',
      name: 'Heading 2',
      fontSize: 24,
      lineHeight: 36,
      wordSpacing: 1,
      letterSpacing: 1,
      color: 'rgba(0, 0, 0, 1)',
      status: TypePresetStatus.Active
    }
  ]
};
