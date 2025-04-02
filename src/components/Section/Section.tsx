import { FC, ReactElement, useEffect, useId, useRef, useState, useContext } from 'react';
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

type SectionChild = ReactElement<any, any>;
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

interface Props {
  section: TSection;
  children: SectionChild[];
  data?: any;
}

function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

export const Section: FC<Props> = ({ section, data, children }) => {
  const id = useId();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { layouts, customSections } = useCntrlContext();
  const layout = useLayoutContext();
  const layoutValues: Record<string, any>[] = [section.height, section.color, section.background ?? {}];
  const SectionComponent = section.name ? customSections.getComponent(section.name) : undefined;
  const isVideo = layout && section.background?.[layout]?.url ? isVideoUrl(String(section.background?.[layout]?.url)) : false;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useSectionRegistry(section.id, sectionRef.current);

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
    if (!isVideo || !sectionRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const section = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.style.display = 'block';
          video.play().catch(() => {});
        } else {
          video.style.display = 'none';
          video.pause();
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0
      }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [isVideo]);

  if (SectionComponent) return <div ref={sectionRef}><SectionComponent data={data}>{children}</SectionComponent></div>;

  // const bg = layout && section.background ? section.background?.[layout] : null;
  // const style = bg ? {
  //   backgroundSize: bg.size === 'auto'
  //     ? `${bg.percentage}%`
  //     : bg.size
  // } : {};

  return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        ref={sectionRef}
      >
        {isVideo && sectionRef.current && layout && (
          <div className={`video-background-overlay-${section.id}`}>
            <div
              key={`video-background-wrapper-${section.id}`}
              className={`video-background-wrapper-${section.id}`}
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className={`video-background-${section.id}`}
              >
                <source src={section.background?.[layout]?.url ?? ''} />
              </video>
            </div>
          </div>
        )}
        {children}
      </div>
      <JSXStyle id={id}>{`
      ${
    getLayoutStyles(layouts, layoutValues, ([height, color, background]) => (`
         .section-${section.id} {
            height: ${getSectionHeight(height)};
            position: relative;
            background-color: ${CntrlColor.parse(color ?? DEFAULT_COLOR).fmt('rgba')};
            background-image: ${background && !isVideo && background.size !== 'none' ? `url(${background.url})` : 'none'};
            background-size: ${background?.size === 'auto' ? `${background?.percentage ?? '50'}%` : background?.size};
            background-position: center;
            background-repeat: ${background?.size === 'contain' ? 'no-repeat' : 'repeat'};
            background-attachment: ${background?.position ?? ''};
         }
         .video-background-overlay-${section.id} {
            height: ${getSectionHeight(height)};
            width: 100%;
            position: relative;
            overflow: clip;
         }
         .video-background-wrapper-${section.id} {
            transform: translateY(-100vh);
            left: 0;
            position: relative;
            height: calc(${getSectionHeight(height)} + 200vh);
            width: 100%;
         }
         .video-background-${section.id} {
            object-fit: ${background?.size ?? 'cover'};
            width: 100%;
            height: ${background?.position === 'fixed' ? '100vh' : '100%'};
            position: ${background?.position === 'fixed' ? 'sticky' : 'relative'};
            top: ${background?.position === 'fixed' ? '100vh' : 'unset'};
            left: 0;
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
