import React, { FC, useMemo } from 'react';
import HTMLReactParser from 'html-react-parser';
import { Article as TArticle, Project, Meta, KeyframeAny } from '@cntrl-site/sdk';
import { Article } from './Article';
import { KeyframesContext } from '../provider/KeyframesContext';
import { CNTRLHead } from './Head';
import { Keyframes } from '../provider/Keyframes';
import { ItemGeometryContext } from '../ItemGeometry/ItemGeometryContext';
import { ItemGeometryService } from '../ItemGeometry/ItemGeometryService';

export interface PageProps {
  article: TArticle;
  project: Project;
  meta: Meta;
  keyframes: KeyframeAny[];
  sectionData: Record<SectionName, any>;
}

export const Page: FC<PageProps> = ({ article, project, meta, keyframes, sectionData }) => {
  const afterBodyOpen = HTMLReactParser(project.html.afterBodyOpen);
  const beforeBodyClose = HTMLReactParser(project.html.beforeBodyClose);
  const keyframesRepo = useMemo(() => new Keyframes(keyframes), [keyframes]);
  const itemGeometryService = useMemo(() => new ItemGeometryService(), []);
  return (
    <>
      <CNTRLHead project={project} meta={meta} />
      {afterBodyOpen}
      <ItemGeometryContext.Provider value={itemGeometryService}>
        <KeyframesContext.Provider value={keyframesRepo}>
          <Article article={article} sectionData={sectionData} />
        </KeyframesContext.Provider>
      </ItemGeometryContext.Provider>
      {beforeBodyClose}
    </>
  );
};

type SectionName = string;
