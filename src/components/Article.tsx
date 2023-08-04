import { FC, useId, useMemo, useRef } from 'react';
import JSXStyle from 'styled-jsx/style';
import { TArticle, TKeyframeAny } from '@cntrl-site/sdk';
import { Section } from './Section';
import { Item } from './Item';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { Keyframes } from '../provider/Keyframes';

interface Props {
  article: TArticle;
  keyframes: TKeyframeAny[];
  sectionData: Record<SectionName, any>;
}

export const Article: FC<Props> = ({ article, sectionData, keyframes }) => {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const articleRectObserver = useArticleRectObserver(articleRef.current);
  const kfRepo = useMemo(() => new Keyframes(keyframes), [keyframes]);
  const id = useId();

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <div className="article" ref={articleRef}>
        {article.sections.map((section, i) => {
          const data = section.name ? sectionData[section.name] : {};
          const sectionKeyframes = kfRepo.getItemsKeyframes(section.items.map(item => item.id));
          return (
            <Section section={section} key={section.id} data={data} keyframes={sectionKeyframes}>
              {article.sections[i].items.map(item => (
                <Item item={item} key={item.id} sectionId={section.id} />
              ))}
            </Section>
          );
        })}
      </div>
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
