import {
  CntrlColor,
  SectionHeightMode,
  TArticleSection,
  TKeyframeAny,
  TSectionHeight,
  getLayoutMediaQuery,
  getLayoutStyles
} from '@cntrl-site/sdk';
import { FC, ReactElement, useRef } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../provider/useCntrlContext';
import { useSectionRegistry } from '../utils/ArticleRectManager/useSectionRegistry';
import { ScrollTracker } from './ScrollTracker';
import { getSectionAnimations } from './useSectionAnimations';

const CSS_VAR_SCROLL_POS = 'section-animation-position';
const DEFAULT_COLOR = 'rgba(0 0 0 / 0)';

type SectionChild = ReactElement<any, any>;

interface Props {
  section: TArticleSection;
  children: SectionChild[];
  keyframes?: TKeyframeAny[];
  data?: any;
}

export const Section: FC<Props> = ({ section, data, children, keyframes }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { layouts, customSections } = useCntrlContext();
  const SectionComponent = section.name ? customSections.getComponent(section.name) : undefined;
  const [animStyles, tracks] = getSectionAnimations({
    section,
    keyframes,
    layouts,
    cssVarName: CSS_VAR_SCROLL_POS
  });

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
              display: ${isHidden ? 'none' : 'block'};
            }
          }
        `;
      }, '');
  };

  if (SectionComponent) {
    return (
      <div ref={sectionRef}>
        <SectionComponent data={data}>{children}</SectionComponent>
      </div>
    );
  }

  return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        ref={sectionRef}
      >
        {children}
      </div>
      <ScrollTracker
        selector={`.section-${section.id}`}
        cssVarName={CSS_VAR_SCROLL_POS}
        layouts={tracks}
      />
      <JSXStyle id={`section-${section.id}-styles`}>
        {getLayoutStyles(layouts, [section.height, section.color], ([height, color]) => {
          const bgColor = CntrlColor.parse(color ?? DEFAULT_COLOR);
          return `
            .section-${section.id} {
              height: ${getSectionHeight(height)};
              color: ${bgColor.fmt('oklch')};
              position: relative;
            }
            @supports not (color: oklch(42% 0.3 90 / 1)) {
              .section-${section.id} {
                background-color: ${bgColor.fmt('rgba')};
              }
            }
          `;
        })}
      </JSXStyle>
      <JSXStyle id={`section-${section.id}-visibility`}>
        {getSectionVisibilityStyles()}
      </JSXStyle>
      {animStyles && <JSXStyle id={`section-${section.id}-animations`}>{animStyles}</JSXStyle>}
    </>
  );
};

export function getSectionHeight(heightData: TSectionHeight): string {
  const { units, vhUnits, mode } = heightData;
  if (mode === SectionHeightMode.ViewportHeightUnits) return `${vhUnits}vh`;
  if (mode === SectionHeightMode.ControlUnits) return `${units * 100}vw`;
  return '0';
}
