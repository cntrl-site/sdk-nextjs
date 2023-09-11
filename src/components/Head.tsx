import React, { FC } from 'react';
import HTMLReactParser, { domToReact } from 'html-react-parser';
import Head from 'next/head';
import { FontFaceGenerator, TMeta, TProject } from '@cntrl-site/sdk';

interface Props {
  project: TProject;
  meta: TMeta;
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
  const links = Object.values(parsedFonts as ReturnType<typeof domToReact>).map((value, i) => {
    if (!value) return;
    const rel = value?.rel || value.props?.rel;
    const href = value?.href || value.props?.href;
    if (!rel || !href) return;
    return (
      <link key={`link-${rel}-${href}`} rel={rel} href={href} />
    );
  });
  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta property="og:image" content={meta.opengraphThumbnail} />
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
