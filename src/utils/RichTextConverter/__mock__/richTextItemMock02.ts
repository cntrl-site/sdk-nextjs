import { ArticleItemType, TextAlign, TRichTextItem } from '@cntrl-site/sdk';

export const richTextItemMock02: TRichTextItem = {
  type: ArticleItemType.RichText,
  id: '01GNVQBH8MS6E4QEAJWTCP1F41',
  area: {
    '01G4J1JJQ7DHTPFW0TVEM2YEWA': {
      top: 0.121875,
      left: 0.169117375,
      width: 0.66640625,
      height: 2.54140625,
      zIndex: 1,
      angle: 0
    }
  },
  visible: {
  '01G4J1JJQ7DHTPFW0TVEM2YEWA': true
  },
  commonParams: {
    sizing: 'auto manual',
    text: 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
    blocks: [{
      start: 0,
      end: 120,
      type: 'unstyled',
      entities: [],
      data: {}
    }, {
      start: 121,
      end: 328,
      type: 'unstyled',
      entities: [],
      data: {}
    }],
    styles: [],
    preset: 'presetId'
  },
  layoutParams: {
    '01G4J1JJQ7DHTPFW0TVEM2YEWA': {
      styles: [],
      textAlign: TextAlign.Left,
      lineHeightLock: false
    }
  }
};
