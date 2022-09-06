import React, { MouseEvent, ReactElement, ReactNode, useEffect } from 'react';

interface Props {
  url?: string;
  children: ReactElement | ReactNode[];
}

export const LinkWrapper: React.FC<Props> = ({ url, children }) => {
  return url ? (
    <a
      href={!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') ? `//${url}`: url}
      target={url.startsWith('/') ? '_self' : '_blank'}
      rel="noreferrer"
    >
      {children}
    </a>
  ) : (
    <>{children}</>
  );
};


