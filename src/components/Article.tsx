import { FC } from 'react';
import { TArticle, TLayout, getLayoutStyles } from '@cntrl-site/sdk';
import { Section } from './Section';
import { Item } from './Item';

interface Props {
  article: TArticle;
  layouts: TLayout[];
}

export const Article: FC<Props> = ({ article, layouts }) => {
  return (
    <>
      <div className="article">
        {article.sections.map((section, i) => (
          <Section section={section} key={section.id} layouts={layouts}>
            {article.sections[i].items.map(item => (
              <Item layouts={layouts} item={item} key={item.id} />
            ))}
          </Section>
        ))}
      </div>
      <style jsx>{`
        ${getLayoutStyles(layouts, [article.color], ([color]) => (`
          .article {
            position: relative;
            overflow: hidden;
            background-color: ${color ? color : 'transparent'};
          }
        `))}
      `}</style>
    </>
  );
};
