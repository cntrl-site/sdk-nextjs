import { StackBlockType, StructuredBlockType } from '@cntrl-site/sdk';
import { ComponentType } from 'react';
import type { StructuredBlockItemProps } from './StructuredBlockItem';
import { StructuredComponent } from './StructuredComponent/StructuredComponent';
import { StructuredRichText } from './StructuredRichText/StructuredRichText';
import { StructuredImage } from './StructuredImage/StructuredImage';
import { StructuredHeaderImage } from './StructuredHeaderImage/StructuredHeaderImage';
import { StructuredVideo } from './StructuredVideo/StructuredVideo';
import { StructuredDivider } from './StructuredDivider/StructuredDivider';
import { StructuredCode } from './StructuredCode/StructuredCode';
import { StructuredTable } from './StructuredTable/StructuredTable';
import { StructuredVimeoEmbed } from './StructuredEmbed/StructuredVimeoEmbed';
import { StructuredYoutubeEmbed } from './StructuredEmbed/StructuredYoutubeEmbed';

/** Drawn for a block of a type this build does not know, should one reach it: nothing, rather than a failed page. */
export const UnknownBlock = () => null;

export const blocksMap: Record<StackBlockType, ComponentType<StructuredBlockItemProps<any>>> = {
  [StructuredBlockType.Component]: StructuredComponent,
  [StructuredBlockType.RichText]: StructuredRichText,
  [StructuredBlockType.Quote]: StructuredRichText,
  [StructuredBlockType.Date]: StructuredRichText,
  [StructuredBlockType.Image]: StructuredImage,
  [StructuredBlockType.HeaderImage]: StructuredHeaderImage,
  [StructuredBlockType.Video]: StructuredVideo,
  [StructuredBlockType.Divider]: StructuredDivider,
  [StructuredBlockType.Code]: StructuredCode,
  [StructuredBlockType.Table]: StructuredTable,
  [StructuredBlockType.VimeoEmbed]: StructuredVimeoEmbed,
  [StructuredBlockType.YoutubeEmbed]: StructuredYoutubeEmbed
};
