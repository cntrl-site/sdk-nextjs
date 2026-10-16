import { StructuredBlockType } from '@cntrl-site/sdk';
import { ComponentType } from 'react';
import type { StructuredBlockItemProps } from './StructuredBlockItem';
import { StructuredComponent } from './StructuredComponent/StructuredComponent';
import { StructuredRichText } from './StructuredRichText/StructuredRichText';
import { StructuredImage } from './StructuredImage/StructuredImage';
import { StructuredHeaderImage } from './StructuredHeaderImage/StructuredHeaderImage';
import { StructuredVideo } from './StructuredVideo/StructuredVideo';
import { StructuredDivider } from './StructuredDivider/StructuredDivider';
import { StructuredCode } from './StructuredCode/StructuredCode';
import { StructuredVimeoEmbed } from './StructuredEmbed/StructuredVimeoEmbed';
import { StructuredYoutubeEmbed } from './StructuredEmbed/StructuredYoutubeEmbed';

const noop = () => null;

export const blocksMap: Record<StructuredBlockType, ComponentType<StructuredBlockItemProps<any>>> = {
  [StructuredBlockType.Component]: StructuredComponent,
  [StructuredBlockType.RichText]: StructuredRichText,
  [StructuredBlockType.Quote]: StructuredRichText,
  [StructuredBlockType.Date]: StructuredRichText,
  [StructuredBlockType.Image]: StructuredImage,
  [StructuredBlockType.HeaderImage]: StructuredHeaderImage,
  [StructuredBlockType.Video]: StructuredVideo,
  [StructuredBlockType.Divider]: StructuredDivider,
  [StructuredBlockType.Code]: StructuredCode,
  [StructuredBlockType.VimeoEmbed]: StructuredVimeoEmbed,
  [StructuredBlockType.YoutubeEmbed]: StructuredYoutubeEmbed,
  // a section's header is drawn by its section, never in the stack
  [StructuredBlockType.Header]: noop
};
