import React, { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';

interface Props {
  url?: string;
  children: ReactElement | ReactNode[];
  target?: string;
  download?: string;
  style?: CSSProperties;
}

export const LinkWrapper: React.FC<Props> = ({ url, children, target, download, style }) => {
  const validUrl = url && buildValidUrl(url);
  const targetParams = target === '_blank' ? { target, rel: 'noreferrer' } : {};
  if (url && validUrl && download !== undefined) {
    return (
      <a
        href={validUrl}
        style={style}
        download={download}
        onClick={(event) => downloadFile(event, validUrl, download)}
      >
        {children}
      </a>
    );
  }
  return url ? (
    <a
      href={validUrl}
      style={style}
      {...targetParams}
    >
      {children}
    </a>
  ) : (
    <>{children}</>
  );
};

function downloadFile(event: MouseEvent<HTMLAnchorElement>, url: string, name: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
      return response.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = name || fileNameOf(url);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    })
    .catch(() => {
      window.location.assign(url);
    });
}

function fileNameOf(url: string): string {
  return decodeURIComponent(url.split('?')[0].split('/').pop() ?? '');
}

function buildValidUrl(url: string): string {
  const prefixes = [
    'http://',
    'https://',
    '/',
    './',
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
