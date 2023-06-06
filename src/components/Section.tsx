import { FC, ReactElement, useId, useRef } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  getLayoutMediaQuery,
  getLayoutStyles,
  TArticleSection,
  TSectionHeight,
  SectionHeightMode
} from '@cntrl-site/sdk';
import { useCntrlContext } from '../provider/useCntrlContext';
import { useSectionColor } from './useSectionColor';
import { useSectionRegistry } from '../utils/ArticleRectManager/useSectionRegistry';

type SectionChild = ReactElement<any, any>;

interface Props {
  section: TArticleSection;
  children: SectionChild[];
}

export const Section: FC<Props> = ({ section, children }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const { layouts } = useCntrlContext();
  const backgroundColor = useSectionColor(section.color);
  useSectionRegistry(section.id, sectionRef.current);
  const getSectionVisibilityStyles = () => {
    return layouts
      .sort((a, b) => a.startsWith - b.startsWith)
      .reduce((acc, layout) => {
        const isHidden = section.hidden[layout.id];
        return `
          ${acc}
          ${getLayoutMediaQuery(layout.id, layouts)} {
            .section-${section.id} {
              display: ${isHidden ? 'none': 'block'};
            }
          }`;
      }, '');
  };

 return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        style={{
          backgroundColor: backgroundColor
        }}
        ref={sectionRef}
      >
        {children}
      </div>
      <JSXStyle id={id}>{`
      ${
        getLayoutStyles(layouts, [section.height], ([height]) => (`
         .section-${section.id} {
            height: ${getSectionHeight(height)};
            position: relative;
          }`
        ))
      }
      ${getSectionVisibilityStyles()}
    `}</JSXStyle>
    </>
  );
};

function getSectionHeight(heightData: TSectionHeight): string {
  const { units, vhUnits, mode } = heightData;
  if (mode === SectionHeightMode.ViewportHeightUnits) return `${vhUnits}vh`;
  if (mode === SectionHeightMode.ControlUnits) return `${units * 100}vw`;
  return '0';
}
