import React, { FC } from 'react';
import HTMLReactParser from 'html-react-parser';
import { TArticle, TProject, TMeta } from '@cntrl-site/sdk';
import { Article } from './Article';
import { CNTRLHead } from './Head';

interface Props {
  article: TArticle;
  project: TProject;
  meta: TMeta;
}

export const Page: FC<Props> = ({ article, project, meta }) => {
  const afterBodyOpen = HTMLReactParser(project.html.afterBodyOpen);
  const beforeBodyClose = HTMLReactParser(project.html.beforeBodyClose);
  return (
    <>
      <CNTRLHead project={project} meta={meta} />
      {afterBodyOpen}
      <Article article={article} layouts={project.layouts} />
      {beforeBodyClose}
    </>
  );
};
