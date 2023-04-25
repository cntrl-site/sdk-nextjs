import React, { ReactElement, ReactNode } from 'react';

interface Props {
  url?: string;
  children: ReactElement | ReactNode[];
}

export const LinkWrapper: React.FC<Props> = ({ url, children }) => {
  const validUrl = url && buildValidUrl(url);
  return url ? (
    <a
      href={validUrl}
      target={url.startsWith('/') || url.startsWith('#') ? '_self' : '_blank'}
      rel="noreferrer"
    >
      {children}
    </a>
  ) : (
    <>{children}</>
  );
};


function buildValidUrl(url: string): string {
  const prefixes = [
    'http://',
    'https://',
    '/',
    'mailto:',
    'tel:',
    'file:',
    'ftp:',
    'javascript',
    '#'
  ];
  const protocolCheck = prefixes.some(prefix => url.startsWith(prefix));
  if (protocolCheck) return url;
  return `//${url}`;
}
