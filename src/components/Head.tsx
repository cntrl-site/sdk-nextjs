import React, { FC } from 'react';
import HTMLReactParser, { domToReact } from 'html-react-parser';
import Head from 'next/head';
import { FontFaceGenerator, Meta, Project } from '@cntrl-site/sdk';

interface Props {
  project: Project;
  meta: Meta;
}

export const CNTRLHead: FC<Props> = ({ meta, project }) => {
  const googleFonts: ReturnType<typeof domToReact> = HTMLReactParser(project.fonts.google);
  const adobeFonts: ReturnType<typeof domToReact> = HTMLReactParser(project.fonts.adobe);
  const parsedFonts = {
    ...(typeof googleFonts === 'object' ? googleFonts : {}),
    ...(typeof adobeFonts === 'object' ? adobeFonts : {})
  };
  const customFonts = project.fonts.custom;
  const htmlHead = HTMLReactParser(project.html.head);
  const ffGenerator = new FontFaceGenerator(customFonts);
  const links = Object.values(parsedFonts as ReturnType<typeof domToReact>).map((value) => {
    if (!value) return null;
    const rel = value?.rel || value.props?.rel;
    const href = value?.href || value.props?.href;
    if (!rel || !href) return null;
    return (
      <link key={`link-${rel}-${href}`} rel={rel} href={href} />
    );
  });
  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:image" content={meta.opengraphThumbnail} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:image" content={meta.opengraphThumbnail} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="generator" content="https://cntrl.site" />
      <link rel="icon" href={meta.favicon} />
      {customFonts.length > 0 && (
        <style
          dangerouslySetInnerHTML={{
            __html: ffGenerator.generate()
          }}
        />
      )}
      {links}
      {htmlHead}

    </Head>
  );
};
