import { FC, ReactElement, useId, useRef } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  getLayoutMediaQuery,
  getLayoutStyles,
  Section as TSection,
  SectionHeight,
  SectionHeightMode
} from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useSectionRegistry } from '../../utils/ArticleRectManager/useSectionRegistry';
import { CntrlColor } from '@cntrl-site/color';

type SectionChild = ReactElement<any, any>;
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

interface Props {
  section: TSection;
  children: SectionChild[];
  data?: any;
}

export const Section: FC<Props> = ({ section, data, children }) => {
  const id = useId();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { layouts, customSections } = useCntrlContext();
  const layoutValues: Record<string, any>[] = [section.height, section.color];
  const SectionComponent = section.name ? customSections.getComponent(section.name) : undefined;
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

  if (SectionComponent) return <div ref={sectionRef}><SectionComponent data={data}>{children}</SectionComponent></div>;

 return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        ref={sectionRef}
      >
        {children}
      </div>
      <JSXStyle id={id}>{`
      ${
        getLayoutStyles(layouts, layoutValues, ([height, color]) => (`
         .section-${section.id} {
            height: ${getSectionHeight(height)};
            position: relative;
            background-color: ${CntrlColor.parse(color ?? DEFAULT_COLOR).fmt('rgba')};
         }`
        ))
      }
      ${getSectionVisibilityStyles()}
    `}</JSXStyle>
    </>
  );
};

export function getSectionHeight(heightData: SectionHeight): string {
  const { units, vhUnits, mode } = heightData;
  if (mode === SectionHeightMode.ViewportHeightUnits) return `${vhUnits}vh`;
  if (mode === SectionHeightMode.ControlUnits) return `${units * 100}vw`;
  return '0';
}
