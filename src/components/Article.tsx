import { FC } from 'react';
import { TArticle, TLayout } from '@cntrl-site/core';
import Section from './Section';
import Item from './Item';

interface Props {
  article: TArticle;
  layouts: TLayout[];
}

const Article: FC<Props> = ({ article, layouts }) => {
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
          .article {
            position: relative;
            overflow-x: hidden;
          }
      `}</style>
    </>
  );
};

export default Article;
