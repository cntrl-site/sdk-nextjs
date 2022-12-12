import React, { ReactElement, ReactNode } from 'react';

interface Props {
  url?: string;
  children: ReactElement | ReactNode[];
}

export const LinkWrapper: React.FC<Props> = ({ url, children }) => {
  const validUrl = validUrlBuild(url!);
  return url ? (
    <a
      // href={!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') ? `//${url}`: url}
      href={validUrl}
      target={url.startsWith('/') ? '_self' : '_blank'}
      rel="noreferrer"
    >
      {children}
    </a>
  ) : (
    <>{children}</>
  );
};


function validUrlBuild(url: string): string {
  const protocols = ['http://', 'https://', '/', 'mailto:', 'tel:', 'file:', 'ftp:', 'javascript', '#'];
  const protocolCheck = protocols.some(protocol => url.startsWith(protocol));
  if (protocolCheck) return url;
  return `//${url}`;
}
