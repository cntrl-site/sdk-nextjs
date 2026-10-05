import { CodeStructuredBlock, CodeToken, getLayoutStyles } from '@cntrl-site/sdk';
import { CSSProperties, FC, Fragment, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';
import { StructuredBlockItemProps } from '../StructuredBlockItem';

// the box and its type are fixed, in pixels of the layout, scaled with it like everything drawn in it
const BOX = { paddingTop: 14, paddingRight: 18, paddingBottom: 16, paddingLeft: 18, radius: 6, border: 1 };
const CODE_FONT_PX = 14;
const CODE_FONT = 'ui-monospace, \'SF Mono\', Menlo, Consolas, \'Liberation Mono\', monospace';
// the default theme's own, for code whose theme could not be loaded
const DEFAULT_COLORS = { background: '#FFFFFF', foreground: '#000000' };
const FONT_STYLE_ITALIC = 1;
const FONT_STYLE_BOLD = 2;
const FONT_STYLE_UNDERLINE = 4;

function tokenStyle({ color, fontStyle = 0 }: CodeToken): CSSProperties {
  return {
    color,
    fontStyle: fontStyle & FONT_STYLE_ITALIC ? 'italic' : undefined,
    fontWeight: fontStyle & FONT_STYLE_BOLD ? 'bold' : undefined,
    textDecoration: fontStyle & FONT_STYLE_UNDERLINE ? 'underline' : undefined
  };
}

/** Code in a box coloured by its theme, as it comes from the API: in lines of coloured tokens. */
export const StructuredCode: FC<StructuredBlockItemProps<CodeStructuredBlock>> = ({ block }) => {
  const reactId = useId();
  const { layouts } = useCntrlContext();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const { lines, colors = DEFAULT_COLORS } = block.commonParams;
  return (
    <div ref={setRef} className={`structured-code-${block.id}`}>
      <pre className={`structured-code-text-${block.id}`}>
        <code>
          {lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && '\n'}
              {line.map((token, tokenIndex) => <span key={tokenIndex} style={tokenStyle(token)}>{token.content}</span>)}
            </Fragment>
          ))}
        </code>
      </pre>
      <JSXStyle id={`${reactId}-code-${block.id}`}>{`
        .structured-code-${block.id} {
          box-sizing: border-box;
          width: 100%;
          border-style: solid;
          background: ${colors.background};
          border-color: color-mix(in srgb, ${colors.foreground} 15%, ${colors.background});
        }
        .structured-code-text-${block.id} {
          margin: 0;
          color: ${colors.foreground};
          font-family: ${CODE_FONT};
          line-height: 1.5;
          tab-size: 2;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: normal;
          font-variant-ligatures: none;
          letter-spacing: 0;
        }
        .structured-code-text-${block.id} code {
          font: inherit;
        }
        ${getLayoutStyles(layouts, [], (_, exemplary) => {
      const px = (value: number) => `${value / exemplary * 100}vw`;
      return (`
            .structured-code-${block.id} {
              padding: ${px(BOX.paddingTop)} ${px(BOX.paddingRight)} ${px(BOX.paddingBottom)} ${px(BOX.paddingLeft)};
              border-width: ${px(BOX.border)};
              border-radius: ${px(BOX.radius)};
            }
            .structured-code-text-${block.id} {
              font-size: ${px(CODE_FONT_PX)};
            }
          `);
    })}
      `}
      </JSXStyle>
    </div>
  );
};
