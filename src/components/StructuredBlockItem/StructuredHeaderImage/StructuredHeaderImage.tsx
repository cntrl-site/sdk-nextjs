import { getLayoutStyles, HeaderImageStructuredBlock } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { BlockCaption } from '../BlockCaption/BlockCaption';

/**
 * A section header's key image with its caption; nothing until an image is uploaded. Where the
 * header draws it as its backdrop, the header styles it: no caption, and covering the header if set to.
 */
export const StructuredHeaderImage: FC<StructuredBlockItemProps<HeaderImageStructuredBlock>> = ({ block, readingWidth }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const { url, altText, caption } = block.commonParams;
  if (!url) return null;
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  return (
    <div ref={setRef} className={`structured-header-image-${block.id}`}>
      <img className={`structured-header-picture-${block.id}`} src={url} alt={altText} />
      {caption && <BlockCaption blockId={block.id} caption={caption} layoutParams={block.layoutParams} readingWidth={readingWidth} />}
      <JSXStyle id={`${reactId}-header-image-${block.id}`}>{`
        .structured-header-image-${block.id} {
          width: 100%;
        }
        .structured-header-picture-${block.id} {
          display: block;
          width: 100%;
          height: auto;
        }
        ${getLayoutStyles(layouts, layoutValues, ([layoutParams]) => (`
          .structured-header-picture-${block.id} {
            opacity: ${layoutParams.opacity};
          }
        `))}
      `}
      </JSXStyle>
    </div>
  );
};
