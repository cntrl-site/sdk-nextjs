import { FC, ReactElement } from 'react';
import { getLayoutMediaQuery, getLayoutStyles, TArticleSection, TLayout, TSectionHeight, SectionHeightMode } from '@cntrl-site/sdk';

type SectionChild = ReactElement<any, any>;

interface Props {
  section: TArticleSection;
  layouts: TLayout[];
  children: SectionChild[];
}

export const Section: FC<Props> = ({ section, layouts, children }) => {
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
      <div className={`section-${section.id}`}>
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
      ${
        getLayoutStyles(layouts, [section.color], ([color]) => (`
         .section-${section.id} {
            background-color: ${color ? color : 'transparent'};
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
