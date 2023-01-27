import { FC, useRef } from 'react';
import { TArticle } from '@cntrl-site/sdk';
import { Section } from './Section';
import { Item } from './Item';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';
import { ArticleRectContext } from '../provider/ArticleRectContext';

interface Props {
  article: TArticle;
}

export const Article: FC<Props> = ({ article }) => {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const articleRectObserver = useArticleRectObserver(articleRef.current);

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <div className="article" ref={articleRef}>
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
    </ArticleRectContext.Provider>
  );
};
