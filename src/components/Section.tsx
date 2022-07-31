import { FC, ReactElement } from 'react';
import { TLayout, TArticleSection } from '@cntrl-site/core';
import { getLayoutStyles } from '@cntrl-site/sdk';

type SectionChild = ReactElement<any, any>;

interface Props {
  section: TArticleSection;
  layouts: TLayout[];
  children: SectionChild[];
}

export const Section: FC<Props> = ({ section, layouts, children }) => (
  <>
    <div className={`section-${section.id}`}>
      {children}
    </div>
    <style jsx>{`
      ${
      getLayoutStyles(layouts, [section.height], ([height]) => (`
         .section-${section.id} {
            height: ${height * 100}vw;
          }`
      ))
    }
    `}</style>
  </>
);
