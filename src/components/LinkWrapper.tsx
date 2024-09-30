import React, { CSSProperties, ReactElement, ReactNode } from 'react';

interface Props {
  url?: string;
  children: ReactElement | ReactNode[];
  target?: string;
  isInteractive?: boolean;
}

export const LinkWrapper: React.FC<Props> = ({ url, children, target, isInteractive = true }) => {
  const validUrl = url && buildValidUrl(url);
  const style: CSSProperties = { pointerEvents: isInteractive ? 'unset' : 'none' };
  return url ? (
    <a
      href={validUrl}
      target={target}
      rel="noreferrer"
      style={style}
    >
      {children}
    </a>
  ) : (
    <span style={style}>{children}</span>
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
