import { FC, ReactElement } from 'react';
import { getLayoutMediaQuery, getLayoutStyles, TArticleSection, TLayout } from '@cntrl-site/sdk';

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
            visibility: ${isHidden ? 'hidden': 'visible'};
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
            height: ${height * 100}vw;
            position: relative;
          }`
        ))
      }
      ${getSectionVisibilityStyles()}
    `}</style>
    </>
  );
};
