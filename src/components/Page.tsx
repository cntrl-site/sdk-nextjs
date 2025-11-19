import React, { FC, useMemo } from 'react';
import HTMLReactParser from 'html-react-parser';
import { Article as TArticle, Project, Meta, KeyframeAny } from '@cntrl-site/sdk';
import { Article } from './Article';
import { KeyframesContext } from '../provider/KeyframesContext';
import { CNTRLHead } from './Head';
import { Keyframes } from '../provider/Keyframes';
import { ItemGeometryRegisterContext } from '../interactions/ItemGeometryRegisterContext';
import { ItemGeometryRegister } from '../interactions/ItemGeometryRegister';

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
  const itemGeometryRepo = useMemo(() => new ItemGeometryRegister(), []);
  return (
    <>
      <CNTRLHead project={project} meta={meta} />
      {afterBodyOpen}
      <ItemGeometryRegisterContext.Provider value={itemGeometryRepo}>
        <KeyframesContext.Provider value={keyframesRepo}>
          <Article article={article} sectionData={sectionData} />
        </KeyframesContext.Provider>
      </ItemGeometryRegisterContext.Provider>
      {beforeBodyClose}
    </>
  );
};

type SectionName = string;
