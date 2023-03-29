import { FC, ReactElement } from 'react';
import {
  getLayoutMediaQuery,
  getLayoutStyles,
  TArticleSection,
  TSectionHeight,
  SectionHeightMode,
  CntrlColor
} from '@cntrl-site/sdk';
import { useCntrlContext } from '../provider/useCntrlContext';
import { useSectionColor } from './useSectionColor';

type SectionChild = ReactElement<any, any>;

interface Props {
  section: TArticleSection;
  children: SectionChild[];
}

export const Section: FC<Props> = ({ section, children }) => {
  const { layouts } = useCntrlContext();
  const backgroundColor = useSectionColor(section.color);
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
        style={{
          backgroundColor: backgroundColor
        }}
      >
        {children}
      </div>
      <style jsx>{`
      ${
        getLayoutStyles(layouts, [section.height], ([height]) => (`
         .section-${section.id} {
            height: ${getSectionHeight(height)};
            position: relative;
          }`
        ))
      }
      ${getSectionVisibilityStyles()}
    `}</style>
    </>
  );
};

function getSectionHeight(heightData: TSectionHeight): string {
  const { units, vhUnits, mode } = heightData;
  if (mode === SectionHeightMode.ViewportHeightUnits) return `${vhUnits}vh`;
  if (mode === SectionHeightMode.ControlUnits) return `${units * 100}vw`;
  return '0';
}
