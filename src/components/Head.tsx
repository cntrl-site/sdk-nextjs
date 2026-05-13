import React, { FC } from 'react';
import HTMLReactParser, { domToReact } from 'html-react-parser';
import Head from 'next/head';
import { FontFaceGenerator, Meta, Project } from '@cntrl-site/sdk';

interface Props {
  project: Project;
  meta: Meta;
  slug?: string;
  siteUrl?: string;
}

export const CNTRLHead: FC<Props> = ({ meta, project, slug, siteUrl }) => {
  const canonicalUrl = buildCanonicalUrl(siteUrl ?? project.primaryDomain, slug);
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
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
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

function buildCanonicalUrl(host: string | null | undefined, slug: string | undefined): string | null {
  if (!host) return null;
  if (slug === undefined) return null;
  const base = parseAsUrl(host);
  if (!base) return null;
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  const relative = stripSlashes(slug);
  const target = relative ? new URL(`${relative}/`, base) : base;
  target.search = '';
  target.hash = '';
  return target.toString();
}

function parseAsUrl(input: string): URL | null {
  return tryParseUrl(input) ?? tryParseUrl(`https://${input}`);
}

function tryParseUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function stripSlashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === '/') start += 1;
  while (end > start && value[end - 1] === '/') end -= 1;
  return value.slice(start, end);
}
