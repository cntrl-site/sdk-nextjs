import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { CntrlColor } from '@cntrl-site/color';
import { getLayoutStyles, VideoItem as TVideoItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useLayoutContext } from '../../useLayoutContext';
import { ScrollPlaybackVideo } from '../../ScrollPlaybackVideo';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useVideoFx } from '../../../utils/effects/useVideoFx';
import { useElementRect } from '../../../utils/useElementRect';
import { useItemFXData } from '../../../common/useItemFXData';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const layoutId = useLayoutContext();
  const {
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeColor: itemStrokeColor,
    opacity: itemOpacity,
    blur: itemBlur
  } = useFileItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const { url, hasGLEffect } = item.commonParams;
  const isInitialRef = useRef(true);
  const area = layoutId ? item.area[layoutId] : null;
  const exemplary = layouts?.find(l => l.id === layoutId)?.exemplary;
  const width = area && exemplary ? area.width * exemplary : 0;
  const height = area && exemplary ? area.height * exemplary : 0;
  const { controlsValues, fragmentShader } = useItemFXData(item, sectionId);
  const rect = useElementRect(ref);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const scrollPlayback = layoutId ? item.layoutParams[layoutId].scrollPlayback : null;
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const hasScrollPlayback = scrollPlayback !== null;
  const wrapperStateParams = interactionCtrl?.getState(['angle', 'opacity', 'blur']);
  const videoStateParams = interactionCtrl?.getState(['strokeWidth', 'radius', 'strokeColor']);
  const borderColor = useMemo(() => {
    const strokeColor = getStyleFromItemStateAndParams(videoStateParams?.styles?.color, itemStrokeColor);
    return strokeColor ? CntrlColor.parse(strokeColor) : undefined;
  }, [videoStateParams?.styles?.color, itemStrokeColor]);
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);
  const strokeWidth = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.strokeWidth, itemStrokeWidth);
  const radius = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.radius, itemRadius);
  useEffect(() => {
    isInitialRef.current = false;
  }, []);
  const isFXAllowed = useVideoFx(
    fxCanvas.current,
    !!(hasGLEffect && !isInitialRef.current),
    {
      videoUrl: url,
      fragmentShader,
      controls: controlsValues
    },
    width,
    height
  );
  useRegisterResize(ref, onResize);
  const inlineStyles = {
    ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
    ...(strokeWidth !== undefined ? { borderWidth: `${strokeWidth * 100}vw` } : {}),
    ...(borderColor ? { borderColor: `${borderColor.toCss()}` } : {}),
    transition: videoStateParams?.transition ?? 'none'
  };
  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`video-wrapper-${item.id}`}
        ref={setRef}
        style={{
          ...(opacity !== undefined ? { opacity } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg) translateZ(0)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          transition: wrapperStateParams?.transition ?? 'none'
        }}
      >
        {hasScrollPlayback
          ? (
              <ScrollPlaybackVideo
                sectionId={sectionId}
                src={item.commonParams.url}
                playbackParams={scrollPlayback}
                style={inlineStyles}
                className={`video video-playback-wrapper video-${item.id}`}
              />
            )
          : (
              <>
                {hasGLEffect && isFXAllowed
                  ? (
                      <canvas
                        style={inlineStyles}
                        ref={fxCanvas}
                        className={`video-canvas video-${item.id}`}
                        width={rectWidth}
                        height={rectHeight}
                      />
                    )
                  : (
                      <video
                        poster={item.commonParams.coverUrl ?? ''}
                        ref={videoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className={`video video-${item.id}`}
                        style={inlineStyles}
                      >
                        <source src={item.commonParams.url} />
                      </video>
                    )}

              </>
            )}
      </div>
      <JSXStyle id={id}>{`
        .video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          opacity: ${opacity};
        }
        .video {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          opacity: 1;
          object-fit: cover;
          overflow: hidden;
          border-style: solid;
        }
        .video-${item.id} {
          border-color: ${itemStrokeColor};
        }
        .video-playback-wrapper {
          display: flex;
          justify-content: center;
        }
        .video-canvas {
          border: solid;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-width: 0;
          box-sizing: border-box;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
      return (`
            .video-wrapper-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg) translateZ(0);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
            }
            .video-${item.id} {
              border-color: ${CntrlColor.parse(layoutParams.strokeColor).fmt('rgba')};
              border-radius: ${layoutParams.radius * 100}vw;
              border-width: ${layoutParams.strokeWidth * 100}vw;
            }
          `);
    })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
