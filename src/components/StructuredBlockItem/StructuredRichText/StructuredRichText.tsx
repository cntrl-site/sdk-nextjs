import { DateStructuredBlock, getLayoutStyles, QuoteStructuredBlock, RichTextStructuredBlock, StructuredBlockType } from '@cntrl-site/sdk';
import { FC, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { RichTextConverter } from '../../../utils/RichTextConverter/RichTextConverter';
import { detectLang } from '../../../utils/detectLang';
import { StructuredBlockItemProps } from '../StructuredBlockItem';
import { colorRule, textStylesRule } from '../textStylesRule';

type TextBlock = RichTextStructuredBlock | QuoteStructuredBlock | DateStructuredBlock;

const richTextConverter = new RichTextConverter();

/**
 * A block of text: rich text, a quote, which is drawn in a box of its own, or a date, which comes as
 * the text it reads as. Its text is set in the styles it was drawn with, its ranges styled over them.
 */
export const StructuredRichText: FC<StructuredBlockItemProps<TextBlock>> = ({ block }) => {
  const reactId = useId();
  const id = `${reactId}-structured-text-${block.id}`;
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const [content, rangeStyles] = useMemo(
    () => richTextConverter.toHtml(block, layouts, { isScaledToViewport: false }),
    [block, layouts]
  );
  const lang = useMemo(() => detectLang(block.commonParams.text), [block.commonParams.text]);
  const isQuote = block.type === StructuredBlockType.Quote;
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  return (
    <>
      <div ref={setRef} lang={lang} className={`structured-text-${block.id}`}>
        {isQuote ? <div className={`structured-quote-box-${block.id}`}>{content}</div> : content}
      </div>
      <JSXStyle id={id}>
        {rangeStyles}
        {`${getLayoutStyles(layouts, layoutValues, ([layoutParams]) => (`
          ${textStylesRule(`.structured-text-${block.id}`, layoutParams)}
          ${isQuote ? `
            .structured-quote-box-${block.id} {
              padding: ${(layoutParams.boxPadding ?? 0) * 100}vw;
              border-radius: ${(layoutParams.boxRadius ?? 0) * 100}vw;
              background-color: transparent;
            }
            ${layoutParams.background ? colorRule(`.structured-quote-box-${block.id}`, 'background-color', layoutParams.background) : ''}
          ` : ''}
        `))}`}
      </JSXStyle>
    </>
  );
};
