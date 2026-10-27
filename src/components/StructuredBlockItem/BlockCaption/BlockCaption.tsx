import { getLayoutStyles, ImageStructuredBlock } from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { textStylesRule } from '../textStylesRule';

interface Props {
  blockId: string;
  caption: string;
  layoutParams: ImageStructuredBlock['layoutParams'];
  readingWidth: Record<string, number>;
}

const CAPTION_GAP_PX = 5;

/** The caption under an image: as wide as the reading column, or as the image where it is narrower, and centered under it. */
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
        ${getLayoutStyles(layouts, layoutValues, ([params, width], exemplary) => (`
          .structured-caption-${blockId} {
            width: ${width !== undefined ? `min(${width * 100}vw, 100%)` : '100%'};
            margin-top: ${CAPTION_GAP_PX / exemplary * 100}vw;
          }
          ${params?.captionStyles ? textStylesRule(`.structured-caption-${blockId}`, params.captionStyles) : ''}
        `))}
      `}
      </JSXStyle>
    </>
  );
};
