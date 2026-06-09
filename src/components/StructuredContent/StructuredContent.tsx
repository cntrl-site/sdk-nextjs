import { getLayoutStyles, Section } from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { StructuredBlockItem } from '../StructuredBlockItem/StructuredBlockItem';

interface Props {
  section: Section;
}

export const StructuredContent: FC<Props> = ({ section }) => {
  const reactId = useId();
  const id = `${reactId}-structured-content-${section.id}`;
  const { layouts } = useCntrlContext();
  const structuredContentLength = section.structuredContent.length;
  const defaultWidthRecord = section.type === 'content-based' ? section.structuredContentSettings.defaultWidth : {};
  const layoutValues: Record<string, any>[] = [section.structuredContentSettings.paddingBottom, defaultWidthRecord];
  if (structuredContentLength === 0) return null;
  return (
    <div className={`structured-content-${section.id}`}>
      {section.structuredContent.map(block => (
        <StructuredBlockItem block={block} key={block.id} maxWidthMap={defaultWidthRecord} />
      ))}
      <JSXStyle id={id}>
        {`
          ${getLayoutStyles(layouts, layoutValues, ([paddingBottom, defaultWidth]) => {
            return (`
              .structured-content-${section.id} {
                padding-bottom: ${paddingBottom * 100}vw;
                max-width: ${defaultWidth < 1 ? `${defaultWidth * 100}vw` : 'unset'};
                display: flex;
                flex-direction: column;
                margin: 0 auto;
                width: 100%;
              }
            `);
          })}
        `}
      </JSXStyle>
    </div>
  );
};
