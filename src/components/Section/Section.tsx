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
  const sectionRectRef = useRef<DOMRect | null>(null);
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
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.style.display = 'block';
            video.play().catch(() => {});
          } else {
            video.style.display = 'none';
            video.pause();
          }
        });
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

  useEffect(() => {
    if ((layout && sectionRef.current && section.background?.[layout]?.position !== 'fixed') || !isVideo) return;
    let rafId: number;
    const updateMask = (): void => {
      sectionRectRef.current = sectionRef.current!.getBoundingClientRect();
      const video = videoRef.current;
      const rect = sectionRectRef.current;
      if (!rect || !video) return;
      const maskTop = (rect.top).toFixed(2);
      const maskBottom = (window.innerHeight - (rect.height + rect.top)).toFixed(2);
      video.style.clipPath = `inset(${maskTop}px 0 ${maskBottom}px 0)`;
      rafId = requestAnimationFrame(updateMask);
    };
    rafId = requestAnimationFrame(updateMask);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [layout, section.id, isVideo]);

  useEffect(() => {
    if ((layout && sectionRef.current && section.background?.[layout]?.position !== 'fixed') || !isVideo) return;
    const handleResize = () => {
      sectionRectRef.current = sectionRef.current!.getBoundingClientRect();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, section.id, isVideo]);

  if (SectionComponent) return <div ref={sectionRef}><SectionComponent data={data}>{children}</SectionComponent></div>;

  return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        ref={sectionRef}
      >
        {isVideo && sectionRef.current && layout && (
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
            background-size: ${background?.size === 'auto' ? `${background?.percentage ?? '50'}%` : background?.size ?? ''};
            background-position: center;
            background-repeat: ${background?.size === 'contain' ? 'no-repeat' : 'repeat'};
            background-attachment: ${background?.position ?? ''};
         }
         .video-background-wrapper-${section.id} {
            top: 0;
            left: 0;
            position: ${background?.position === 'fixed' ? 'fixed' : 'relative'};
            height: 100%;
            width: 100%;
            overflow: hidden;
         }
         .video-background-${section.id} {
            object-fit: ${background?.size ?? 'cover'};
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            will-change: transform;
            transform: translateZ(0);
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
