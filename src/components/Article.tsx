import { FC, useId, useRef } from 'react';
import JSXStyle from 'styled-jsx/style';
import { TArticle } from '@cntrl-site/sdk';
import { Section } from './Section';
import { Item } from './Item';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { ArticleWrapper } from './ArticleWrapper';

interface Props {
  article: TArticle;
  sectionData: Record<SectionName, any>;
}

export const Article: FC<Props> = ({ article, sectionData }) => {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const articleRectObserver = useArticleRectObserver(articleRef.current);
  const id = useId();

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <ArticleWrapper>
        <div className="article" ref={articleRef}>
          {article.sections.map((section, i) => {
            const data = section.name ? sectionData[section.name] : {};
            return (
              <Section section={section} key={section.id} data={data}>
                {article.sections[i].items.map(item => (
                  <Item item={item} key={item.id} sectionId={section.id} />
                ))}
              </Section>
            );
          })}
        </div>
      </ArticleWrapper>
      <JSXStyle id={id}>{`
       .article {
            position: relative;
            overflow: clip;
          }
      `}</JSXStyle>
    </ArticleRectContext.Provider>
  );
};

type SectionName = string;
