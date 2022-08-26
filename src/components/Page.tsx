import React, { FC } from 'react';
import HTMLReactParser, { domToReact } from 'html-react-parser';
import { TArticle, TProject, TMeta, TPageMeta } from '@cntrl-site/core';
import Head from 'next/head';
import { Article } from './Article';

interface Props {
  article: TArticle;
  project: TProject;
  meta: TMeta;
}

export const Page: FC<Props> = ({ article, project, meta }) => {
  const googleFonts: ReturnType<typeof domToReact> = HTMLReactParser(project.fonts.google);
  const adobeFonts: ReturnType<typeof domToReact> = HTMLReactParser(project.fonts.adobe);

  const getPageMeta = (projectMeta: TMeta, pageMeta: TPageMeta): TMeta => {
    return {
      title: pageMeta.title ? pageMeta.title : projectMeta.title,
      description: pageMeta.description ? pageMeta.description : projectMeta.description,
      keywords: pageMeta.keywords ? pageMeta.keywords : projectMeta.keywords,
      opengraphThumbnail: pageMeta.opengraphThumbnail ? pageMeta.opengraphThumbnail : projectMeta.opengraphThumbnail,
      favicon: projectMeta.favicon
    };
  };
  const priorityMeta = getPageMeta(project.meta, meta);
  const parsedFonts = {
    ...(typeof googleFonts === 'object' ? googleFonts : {}),
    ...(typeof adobeFonts === 'object' ? adobeFonts : {})
  };
  const customFonts = project.fonts.custom;
  const htmlHead = HTMLReactParser(project.html.head);
  const afterBodyOpen = HTMLReactParser(project.html.afterBodyOpen);
  const beforeBodyClose = HTMLReactParser(project.html.beforeBodyClose);
  return (
    <>
      <Head>
        <title>{priorityMeta.title}</title>
        <meta name="description" content={priorityMeta.description} />
        <meta name="keywords" content={priorityMeta.keywords} />
        <meta property="og:image" content={priorityMeta.opengraphThumbnail} />
        <link rel="icon" href={priorityMeta.favicon} />
        {customFonts.length > 0 && (
          <style
            dangerouslySetInnerHTML={{
              __html: customFonts.map((font) => (
                `
                @font-face {
                  font-family: ${font.name};
                  font-weight: ${font.weight};
                  src: ${font.files.map(file => `url('${file.url}') format('${file.type}')`).join(', ')};
                }
              `
              )).join('\n')
            }}
          />
        )}
        {Object.values(parsedFonts as ReturnType<typeof domToReact>).map((value, i) => {
          if (!value) return undefined;
          const rel = value?.rel || value.props?.rel;
          const href = value?.href || value.props?.href;
          if (!rel || !href) return undefined;
          return (
            <link key={i} rel={rel} href={href} />
          );
        })}
        {htmlHead}

      </Head>
      {afterBodyOpen}
      <Article article={article} layouts={project.layouts} />
      {beforeBodyClose}
    </>
  );
};
