import { FC } from 'react';
import { TArticle } from '@cntrl-site/sdk';
import { Section } from './Section';
import { Item } from './Item';

interface Props {
  article: TArticle;
}

export const Article: FC<Props> = ({ article }) => {
  return (
    <>
      <div className="article">
        {article.sections.map((section, i) => (
          <Section section={section} key={section.id}>
            {article.sections[i].items.map(item => (
              <Item item={item} key={item.id} />
            ))}
          </Section>
        ))}
      </div>
      <style jsx>{`
       .article {
            position: relative;
            overflow: hidden;
          }
      `}</style>
    </>
  );
};
