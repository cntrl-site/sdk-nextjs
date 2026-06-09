import React, { FC, ReactElement, useId, useRef, useMemo, useState, useEffect, PropsWithChildren } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  getLayoutMediaQuery,
  getLayoutStyles,
  Section as TSection,
  SectionHeight,
  SectionHeightMode
} from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useSectionRegistry } from '../../utils/ArticleRectManager/useSectionRegistry';
import { CntrlColor } from '@cntrl-site/color';
import { useLayoutContext } from '../useLayoutContext';
import { SectionVideo } from './SectionVideo';
import { SectionImage } from './SectionImage';
import { isOverflowClipSupported } from '../../utils/checkOverflowClipSupport';
import { StructuredContent } from '../StructuredContent/StructuredContent';
import { Item } from '../items/Item';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

interface Props {
  section: TSection;
  zIndex: number;
  data?: any;
  articleHeight: number;
}

export const Section: FC<PropsWithChildren<Props>> = ({ section, data, zIndex, articleHeight }) => {
  const reactId = useId();
  const id = `${reactId}-section-${section.id}`;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { layouts, customSections } = useCntrlContext();
  const layout = useLayoutContext();
  const [sectionHeight, setSectionHeight] = useState(0);
  const layoutValues: Record<string, any>[] = [
    section.minHeight,
    section.color,
    section.media ?? {}
  ];

  const SectionComponent = section.name ? customSections.getComponent(section.name) : undefined;
  useSectionRegistry(section.id, sectionRef.current);
  const layoutMedia = layout && section.media && section.media[layout] ? section.media[layout] : undefined;

  const media = useMemo(() => {
    if (layoutMedia && !isOverflowClipSupported()) {
      return {
        ...layoutMedia,
        position: 'local'
      };
    }
    return layoutMedia;
  }, [layoutMedia]);

  const getSectionVisibilityStyles = () => {
    return layouts
      .sort((a, b) => a.startsWith - b.startsWith)
      .reduce((acc, layout) => {
        const isHidden = section.hidden[layout.id];
        return `
          ${acc}
          ${getLayoutMediaQuery(layout.id, layouts)} {
            .section-${section.id} {
              display: ${isHidden ? 'none' : 'block'};
            }
          }`;
      }, '');
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      const height = entry.contentRect.height;
      setSectionHeight(height);
    });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const children = (
    <>
      <StructuredContent section={section} />
      {section.items.map(item => (
        <Item
          sectionHeight={sectionHeight}
          item={item}
          key={item.id}
          sectionId={section.id}
          articleHeight={articleHeight}
        />
      ))}
    </>
  );

  if (SectionComponent) return <div ref={sectionRef}><SectionComponent data={data}>{children}</SectionComponent></div>;

  return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        ref={sectionRef}
        style={{ zIndex }}
      >
        {media && media.size !== 'none' && sectionRef.current && (
          <div className={`section-background-overlay-${section.id}`}>
            <div
              key={`section-background-wrapper-${section.id}`}
              className={`section-background-wrapper-${section.id}`}
              style={{
                transform: media.position === 'fixed' ? 'translateY(-100vh)' : 'unset',
                ...(sectionHeight && { height: media.position === 'fixed' ? `calc(${sectionHeight}px + 200vh)` : `${sectionHeight}px` })
              }}
            >
              {media.type === 'video' && (
                <SectionVideo container={sectionRef.current} sectionId={section.id} media={media} />
              )}
              {media.type === 'image' && (
                <SectionImage media={media} sectionId={section.id} />
              )}
            </div>
          </div>
        )}
        {children}
      </div>
      <JSXStyle id={id}>{`
      ${
    getLayoutStyles(layouts, layoutValues, ([height, color, media]) => (`
         .section-${section.id} {
            min-height: ${getSectionHeight(height)};
            position: relative;
            background-color: ${CntrlColor.parse(color ?? DEFAULT_COLOR).fmt('rgba')};
         }
         .section-background-overlay-${section.id} {
            height: 100%;
            width: 100%;
            position: absolute;
            overflow: clip;
         }
         .section-background-wrapper-${section.id} {
            transform: ${media?.position === 'fixed' ? 'translateY(-100vh)' : 'unset'};
            position: relative;
            height: ${media?.position === 'fixed' ? `calc(${getSectionHeight(height)} + 200vh)` : getSectionHeight(height)};
            width: 100%;
         }
        `
    ))
    }
      ${getSectionVisibilityStyles()}
    `}</JSXStyle>
    </>
  );
};

export function getSectionHeight(heightData: SectionHeight): string {
  const { units, vhUnits, mode } = heightData;
  if (mode === SectionHeightMode.ViewportHeightUnits) return `${vhUnits}vh`;
  if (mode === SectionHeightMode.ControlUnits) return `${units * 100}vw`;
  return '0';
}
