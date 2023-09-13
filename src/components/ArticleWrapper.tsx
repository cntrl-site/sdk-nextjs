import React, { CSSProperties, FC, PropsWithChildren, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { LayoutContext } from '../provider/LayoutContext';

export const ArticleWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
  const id = useId();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const { layoutId, layoutDeviation } = useCurrentLayout();

  useEffect(() => {
    const onPageLoad = () => {
      setIsPageLoaded(true);
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', onPageLoad);
      return () => window.removeEventListener('DOMContentLoaded', onPageLoad);
    } else {
      onPageLoad();
    }
  }, []);
  const layoutDeviationStyle = {'--layout-deviation': layoutDeviation} as CSSProperties;

  return (
    <LayoutContext.Provider value={layoutId}>
      <div
        className="article-wrapper"
        style={{
          opacity: layoutId && isPageLoaded ? 1 : 0,
          ...layoutDeviationStyle
        }}
      >
        {children}
      </div>
      <JSXStyle id={id}>{`
        .article-wrapper {
          opacity: 1;
          transition: opacity 0.2s ease; 
        }
      `}</JSXStyle>
    </LayoutContext.Provider>
  );
};
