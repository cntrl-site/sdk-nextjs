import { getLayoutStyles, Section } from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { StructuredBlockItem } from '../StructuredBlockItem/StructuredBlockItem';
import { StructuredHeader } from './StructuredHeader';

interface Props {
  section: Section;
}

/**
 * A section's blocks, one under another across the section's whole width: a block drawn from a
 * preset is placed on the content grid by its own area. A content-based section's header comes
 * first, drawing the blocks it points at, which the stack leaves out.
 */
export const StructuredContent: FC<Props> = ({ section }) => {
  const reactId = useId();
  const id = `${reactId}-structured-content-${section.id}`;
  const { layouts } = useCntrlContext();
  const header = section.type === 'content-based' ? section.header : undefined;
  const headerElementIds: string[] = header ? Object.values(header.commonParams) : [];
  const readingWidth = section.type === 'content-based' ? section.structuredContentSettings.defaultWidth : {};
  const layoutValues: Record<string, any>[] = [section.structuredContentSettings.paddingBottom];
  if (section.structuredContent.length === 0 && !header) return null;
  return (
    <div className={`structured-content-${section.id}`}>
      {header && <StructuredHeader header={header} blocks={section.structuredContent} readingWidth={readingWidth} />}
      {section.structuredContent
        .filter(block => !headerElementIds.includes(block.id))
        .map(block => <StructuredBlockItem block={block} key={block.id} readingWidth={readingWidth} />)}
      <JSXStyle id={id}>
        {`
          .structured-content-${section.id} {
            display: flex;
            flex-direction: column;
            width: 100%;
          }
          ${getLayoutStyles(layouts, layoutValues, ([paddingBottom]) => (`
            .structured-content-${section.id} {
              padding-bottom: ${(paddingBottom ?? 0) * 100}vw;
            }
          `))}
        `}
      </JSXStyle>
    </div>
  );
};
