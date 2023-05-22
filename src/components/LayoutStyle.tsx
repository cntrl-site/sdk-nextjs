import React, { FC } from 'react';
import { getLayoutMediaQuery, TLayout } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';

export interface LayoutStyleProps {
  id: string;
  layouts: TLayout[];
  layoutId: string;
  children?: (layout: TLayout) => string;
}

export const LayoutStyle: FC<LayoutStyleProps> = ({ id, layouts, layoutId, children }) => {
  const layout = layouts.find(l => l.id === layoutId)!;
  return (
    <JSXStyle id={id}>{`
      ${getLayoutMediaQuery(layoutId, layouts)} {
        ${children?.(layout)}
      }
    `}</JSXStyle>
  );
};
