import React, { FC, useMemo } from 'react';
import HTMLReactParser from 'html-react-parser';
import { TArticle, TProject, TMeta, TKeyframeAny } from '@cntrl-site/sdk';
import { Article } from './Article';
import { KeyframesContext } from '../provider/KeyframesContext';
import { CNTRLHead } from './Head';
import { useCntrlContext } from '../provider/useCntrlContext';
import { generateTypePresetStyles } from '../utils/generateTypePresetStyles/generateTypePresetStyles';
import { Keyframes } from '../provider/Keyframes';

export interface PageProps {
  article: TArticle;
  project: TProject;
  meta: TMeta;
  keyframes: TKeyframeAny[];
  sectionData: Record<string, any>;
}

export const Page: FC<PageProps> = ({ article, project, meta, keyframes, sectionData }) => {
  const afterBodyOpen = HTMLReactParser(project.html.afterBodyOpen);
  const beforeBodyClose = HTMLReactParser(project.html.beforeBodyClose);
  const keyframesRepo = useMemo(() => new Keyframes(keyframes), [keyframes]);
  const { typePresets, layouts } = useCntrlContext();
  return (
    <>
      <CNTRLHead project={project} meta={meta} />
      {afterBodyOpen}
      <KeyframesContext.Provider value={keyframesRepo}>
        <Article article={article} sectionData={sectionData} />
      </KeyframesContext.Provider>
      {beforeBodyClose}
      {typePresets && typePresets.presets.length > 0 && (
        <style>{generateTypePresetStyles(typePresets, layouts)}</style>
      )}
    </>
  );
};
