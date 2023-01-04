import React, { FC } from 'react';
import HTMLReactParser from 'html-react-parser';
import { TArticle, TProject, TMeta } from '@cntrl-site/sdk';
import { Article } from './Article';
import { CNTRLHead } from './Head';
import { useCntrlContext } from '../provider/useCntrlContext';
import { generateTypePresetStyles } from '../utils/generateTypePresetStyles/generateTypePresetStyles';

interface Props {
  article: TArticle;
  project: TProject;
  meta: TMeta;
}

export const Page: FC<Props> = ({ article, project, meta }) => {
  const afterBodyOpen = HTMLReactParser(project.html.afterBodyOpen);
  const beforeBodyClose = HTMLReactParser(project.html.beforeBodyClose);
  const { typePresets, layouts } = useCntrlContext();
  return (
    <>
      <CNTRLHead project={project} meta={meta} />
      {afterBodyOpen}
      <Article article={article} />
      {beforeBodyClose}
      {typePresets && typePresets.presets.length > 0 && (
        <style>{generateTypePresetStyles(typePresets, layouts)}</style>
      )}
    </>
  );
};
