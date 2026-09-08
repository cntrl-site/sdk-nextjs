import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { Article as TArticle, ProjectNavigation } from '@cntrl-site/sdk';
import { Section } from './Section/Section';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { ArticleWrapper } from './ArticleWrapper';
import { InteractionsProvider } from '../provider/InteractionsContext';
import { WebglContextManagerContext } from '../provider/WebGLContextManagerContext';
import { WebGLContextManager } from '@cntrl-site/effects';
import { Navigation } from './Navigation/Navigation';

interface Props {
  article: TArticle;
  sectionData: Record<SectionName, any>;
  navigation?: ProjectNavigation | null;
  pages?: Array<{ id: string; slug: string }>;
}

export const Article: FC<Props> = ({ article, sectionData, navigation, pages = [] }) => {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const articleRectObserver = useArticleRectObserver(articleRef.current);
  const id = useId();
  const [articleHeight, setArticleHeight] = useState(1);

  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', (rect) => {
      setArticleHeight(rect.height / rect.width);
    });
  }, [articleRectObserver]);

  const webglContextManager = useMemo(() => new WebGLContextManager(), []);
  const sectionsLength = article.sections.length;

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <InteractionsProvider article={article}>
        <ArticleWrapper>
          {navigation && <Navigation navigation={navigation} pages={pages} />}
          <div className="article" ref={articleRef}>
            <WebglContextManagerContext.Provider value={webglContextManager}>
              {article.sections.map((section, i) => {
                const data = section.name ? sectionData[section.name] : {};
                return (
                  <Section
                    articleHeight={articleHeight}
                    section={section}
                    key={section.id}
                    data={data}
                    zIndex={sectionsLength - i}
                  />
                );
              })}
            </WebglContextManagerContext.Provider>
            <div id="component-portal" />
            <div id="grid-component-lightbox-portal" />
          </div>
        </ArticleWrapper>
        <JSXStyle id={id}>{`
       .article {
         position: relative;
         overflow: clip;
       }
      `}</JSXStyle>
      </InteractionsProvider>
    </ArticleRectContext.Provider>
  );
};

type SectionName = string;
