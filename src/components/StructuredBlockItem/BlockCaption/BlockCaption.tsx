import { getLayoutStyles, ImageStructuredBlock } from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { textStylesRule } from '../textStylesRule';
import { vw } from '../vw';

interface Props {
  blockId: string;
  caption: string;
  layoutParams: ImageStructuredBlock['layoutParams'];
  readingWidth: Record<string, number>;
}

const CAPTION_GAP_PX = 5;

/**
 * The caption under an image, centered under it: as wide as the caption preset says, else as the
 * reading column, or as the image where that is narrower; with the preset's space above and below its text.
 */
export const BlockCaption: FC<Props> = ({ blockId, caption, layoutParams, readingWidth }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const layoutValues: Record<string, any>[] = [layoutParams, readingWidth];
  return (
    <>
      <div className={`structured-caption-${blockId}`}>{caption}</div>
      <JSXStyle id={`${reactId}-caption-${blockId}`}>{`
        .structured-caption-${blockId} {
          margin-left: auto;
          margin-right: auto;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
        ${getLayoutStyles(layouts, layoutValues, ([params, readingColumn], exemplary) => {
          const captionStyles = params?.captionStyles;
          const width = captionStyles?.width ?? readingColumn;
          return `
            .structured-caption-${blockId} {
              width: ${width !== undefined ? `min(${vw(width)}, 100%)` : '100%'};
              margin-top: ${CAPTION_GAP_PX / exemplary * 100}vw;
              padding-top: ${vw(captionStyles?.paddingTop)};
              padding-bottom: ${vw(captionStyles?.paddingBottom)};
            }
            ${captionStyles ? textStylesRule(`.structured-caption-${blockId}`, captionStyles) : ''}
          `;
        })}
      `}
      </JSXStyle>
    </>
  );
};
