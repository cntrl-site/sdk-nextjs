import { getLayoutStyles } from '@cntrl-site/sdk';
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { vw } from '../StructuredBlockItem/vw';

export interface LightboxImage {
  src: string;
  alt: string;
}

interface Props {
  images: LightboxImage[];
  initialIndex: number;
  /** Called once the lightbox has closed: the moment to unmount it. */
  onClose: () => void;
  /**
   * The element on the page that shows the image at an index. Given it, the lightbox opens by
   * moving a copy of the image from that place to the middle of the screen and closes by moving the
   * image shown back to its own, the page itself staying as it is; without it, or for a reader who
   * asked for less motion, it fades in and out.
   */
  originOf?: (index: number) => HTMLElement | null;
}

interface OverlayProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  originOf?: (index: number) => HTMLElement | null;
}

type Rect = { top: number; left: number; width: number; height: number };
type SwipeAxis = 'none' | 'horizontal' | 'vertical';

const PORTAL_ID = 'component-portal';
const ANIM_MS = 500;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_CLOSE_THRESHOLD = 72;
const SWIPE_NAV_THRESHOLD = 50;
const BACKDROP = 'rgba(28,31,34,0.9)';

// the close icon's size and its margins as shares of the layout width, on the layouts a project
// starts with: a narrower layout takes larger ones, to keep the icon a size to tap. Any other
// layout takes the desktop's.
const CLOSE_ICON: Record<string, { size: number; marginTop: number; marginRight: number }> = {
  m: { size: 0.081, marginTop: 0.081, marginRight: 0.05405 },
  t: { size: 0.03906, marginTop: 0.026, marginRight: 0.026 },
  d: { size: 0.0125, marginTop: 0.01, marginRight: 0.01 }
};

function rectOf(element: HTMLElement): Rect {
  const { top, left, width, height } = element.getBoundingClientRect();
  return { top, left, width, height };
}

/** Where an image starts from or returns to: the place of its element on the page, if it has one and takes up room there. */
function originRect(origin: HTMLElement | null | undefined): Rect | null {
  if (!origin) return null;
  const rect = rectOf(origin);
  return rect.width && rect.height ? rect : null;
}

/** The transform that draws an element laid out at `from` over `to`, its top left corner the one held in place. */
function moveTo(from: Rect, to: Rect): string {
  return `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function containIn(box: Rect, natural: { width: number; height: number } | null): Rect {
  if (!natural || !natural.width || !natural.height || !box.width || !box.height) return box;
  const imageRatio = natural.width / natural.height;
  if (imageRatio > box.width / box.height) {
    const height = box.width / imageRatio;
    return { width: box.width, height, left: box.left, top: box.top + (box.height - height) / 2 };
  }
  const width = box.height * imageRatio;
  return { width, height: box.height, left: box.left + (box.width - width) / 2, top: box.top };
}

/**
 * A full-screen viewer of images, one at a time, each fitted within the screen: stepped through by
 * the halves of the image or a sideways swipe, around from the last to the first, and closed by
 * Escape, the backdrop, the close icon or a swipe down. Told where its images are on the page, it
 * opens the first out of its place there and closes the one shown back into its own. It holds the
 * page still while it is up. Mount it to open it, and unmount it when it calls `onClose`.
 */
export const ImageLightbox: FC<Props> = ({ images, initialIndex, onClose, originOf }) => {
  const { layouts } = useCntrlContext();
  const [index, setIndex] = useState(initialIndex);
  const count = images.length;
  const showPrev = useCallback(() => setIndex(prev => (prev - 1 + count) % count), [count]);
  const showNext = useCallback(() => setIndex(prev => (prev + 1) % count), [count]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <Overlay images={images} index={index} onClose={onClose} onPrev={showPrev} onNext={showNext} originOf={originOf} />
      <JSXStyle id="image-lightbox">{`
        .image-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9997;
          overscroll-behavior: none;
          overflow: hidden;
        }
        .image-lightbox-close {
          all: unset;
          display: block;
          flex-shrink: 0;
          cursor: pointer;
          color: #FFFFFF;
          transition: color 0.2s;
        }
        .image-lightbox-close:hover {
          color: #999999;
        }
        .image-lightbox-close:focus-visible {
          outline: 1px solid currentColor;
          outline-offset: 4px;
        }
        .image-lightbox-close > svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        ${getLayoutStyles(layouts, [CLOSE_ICON], ([icon = CLOSE_ICON.d]) => (`
          .image-lightbox-close-row {
            height: ${vw(icon.marginTop)};
          }
          .image-lightbox-close {
            width: ${vw(icon.size)};
            height: ${vw(icon.size)};
            margin-right: ${vw(icon.marginRight)};
          }
        `))}
      `}
      </JSXStyle>
    </>,
    document.getElementById(PORTAL_ID) ?? document.body
  );
};

const Overlay: FC<OverlayProps> = ({ images, index, onClose, onPrev, onNext, originOf }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeOffsetRef = useRef(0);
  const swipeDeltaXRef = useRef(0);
  const swipeAxisRef = useRef<SwipeAxis>('none');
  const isSwipingRef = useRef(false);
  const touchInteractionRef = useRef(false);
  const viewportRectRef = useRef<Rect | null>(null);
  const slideOffsetRef = useRef(0);
  const slideDirRef = useRef<1 | -1 | null>(null);
  const slideAnimatingRef = useRef(false);
  const slideCommitTimerRef = useRef<number | null>(null);
  const slideCommitDirectionRef = useRef<1 | -1 | null>(null);
  const rapidNavDirectionRef = useRef<1 | -1 | null>(null);
  const startProgrammaticSlideRef = useRef<(dir: 1 | -1) => void>(() => {});
  const [finalRect, setFinalRect] = useState<Rect | null>(null);
  const [viewportRect, setViewportRect] = useState<Rect | null>(null);
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1 | null>(null);
  const [slideAnimating, setSlideAnimating] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDismiss, setSwipeDismiss] = useState(false);
  const current = images[index];
  // whether images move between their places on the page and the lightbox, settled as it opens
  const [moves] = useState(() => Boolean(originOf) && !prefersReducedMotion());
  // the place the first image opens out of, with the size its file is known to have there, which
  // fits it in the lightbox before its own copy has loaded
  const [opening] = useState(() => {
    const origin = moves ? originOf?.(index) : null;
    const rect = originRect(origin);
    const picture = origin instanceof HTMLImageElement ? origin : origin?.querySelector('img');
    return rect ? { rect, natural: picture?.naturalWidth && picture.naturalHeight ? { width: picture.naturalWidth, height: picture.naturalHeight } : null } : null;
  });
  // the place the image shown closes back into, measured when it starts to; none while it is open, or where it has none
  const [closingRect, setClosingRect] = useState<Rect | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(opening?.natural ?? null);
  const prevIndexRef = useRef(index);
  const prevSrcRef = useRef<string | undefined>(current?.src);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
  }, []);

  useEffect(() => {
    viewportRectRef.current = viewportRect;
  }, [viewportRect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => setViewportRect(rectOf(container));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const clearSlideCommitTimer = useCallback(() => {
    if (slideCommitTimerRef.current !== null) {
      window.clearTimeout(slideCommitTimerRef.current);
      slideCommitTimerRef.current = null;
    }
  }, []);

  const commitSlideNavigation = useCallback(() => {
    const dir = slideCommitDirectionRef.current;
    slideCommitDirectionRef.current = null;
    clearSlideCommitTimer();
    slideDirRef.current = null;
    slideAnimatingRef.current = false;
    setSlideDir(null);
    setSlideAnimating(false);
    setSlideOffset(0);
    slideOffsetRef.current = 0;
    setIsSwiping(false);
    isSwipingRef.current = false;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';

    if (dir === 1) onNext();
    else if (dir === -1) onPrev();
  }, [clearSlideCommitTimer, onNext, onPrev]);

  const cancelSlideAnimation = useCallback(() => {
    clearSlideCommitTimer();
    slideCommitDirectionRef.current = null;
    slideDirRef.current = null;
    slideAnimatingRef.current = false;
    setSlideDir(null);
    setSlideAnimating(false);
    setSlideOffset(0);
    slideOffsetRef.current = 0;
  }, [clearSlideCommitTimer]);

  // the transition's own end may never be told, in a tab left in the background say: the timer commits the slide then
  const scheduleSlideCommit = useCallback(() => {
    clearSlideCommitTimer();
    slideCommitTimerRef.current = window.setTimeout(() => {
      if (slideCommitDirectionRef.current === null) return;
      commitSlideNavigation();
    }, ANIM_MS + 32);
  }, [clearSlideCommitTimer, commitSlideNavigation]);

  const finishSlide = useCallback((dir: 1 | -1, commit: boolean) => {
    const width = viewportRectRef.current?.width ?? 0;
    clearSlideCommitTimer();
    slideDirRef.current = dir;
    setSlideDir(dir);
    slideAnimatingRef.current = true;
    setSlideAnimating(true);

    if (commit) {
      slideCommitDirectionRef.current = dir;
      const target = -dir * width;
      slideOffsetRef.current = target;
      setSlideOffset(target);
      scheduleSlideCommit();
      return;
    }

    slideOffsetRef.current = 0;
    setSlideOffset(0);
    slideCommitTimerRef.current = window.setTimeout(() => {
      slideCommitTimerRef.current = null;
      cancelSlideAnimation();
    }, ANIM_MS + 32);
  }, [clearSlideCommitTimer, cancelSlideAnimation, scheduleSlideCommit]);

  const startProgrammaticSlide = useCallback((dir: 1 | -1) => {
    if (images.length <= 1) return;

    if (slideAnimatingRef.current) {
      // a second step the same way while the first still slides: the first lands at once and the second starts from there
      if (slideCommitDirectionRef.current === dir) {
        rapidNavDirectionRef.current = dir;
        commitSlideNavigation();
        return;
      }
      cancelSlideAnimation();
    }

    clearSlideCommitTimer();
    slideDirRef.current = dir;
    setSlideDir(dir);
    slideAnimatingRef.current = false;
    setSlideAnimating(false);
    slideOffsetRef.current = 0;
    setSlideOffset(0);
    // the neighbour is drawn at rest beside the image first, so that the slide has somewhere to start from
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        finishSlide(dir, true);
      });
    });
  }, [images.length, finishSlide, commitSlideNavigation, cancelSlideAnimation, clearSlideCommitTimer]);

  startProgrammaticSlideRef.current = startProgrammaticSlide;

  const handleSlideTransitionEnd = useCallback((event: React.TransitionEvent<HTMLElement>) => {
    if (event.propertyName !== 'transform' || !slideAnimatingRef.current) return;
    if (slideCommitDirectionRef.current === null) return;
    commitSlideNavigation();
  }, [commitSlideNavigation]);

  const computeFinalRect = useCallback(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;
    const rect = rectOf(ghost);
    if (!rect.width || !rect.height) return;
    setFinalRect(rect);
  }, []);

  useEffect(() => {
    computeFinalRect();
    const ghost = ghostRef.current;
    if (!ghost) return;
    const observer = new ResizeObserver(() => computeFinalRect());
    observer.observe(ghost);
    return () => observer.disconnect();
  }, [computeFinalRect]);

  useEffect(() => {
    if (phase !== 'opening' || !finalRect) return;
    if (!opening) {
      setPhase('open');
      return;
    }
    // the image is drawn over its place on the page first, so that it has somewhere to move from
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPhase('open'));
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, finalRect, opening]);

  const close = useCallback(() => {
    const rect = moves ? originRect(originOf?.(index)) : null;
    setClosingRect(rect);
    setPhase('closing');
    return rect !== null;
  }, [moves, originOf, index]);
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = setTimeout(() => onClose(), ANIM_MS);
    return () => clearTimeout(timer);
  }, [phase, onClose]);

  useEffect(() => {
    return () => {
      clearSlideCommitTimer();
    };
  }, [clearSlideCommitTimer]);

  useLayoutEffect(() => {
    if (prevIndexRef.current === index && prevSrcRef.current === current?.src) return;

    clearSlideCommitTimer();
    slideCommitDirectionRef.current = null;
    setSlideDir(null);
    setSwipeOffset(0);
    setSlideOffset(0);
    setSlideAnimating(false);
    setSwipeDismiss(false);
    setIsSwiping(false);
    setNaturalSize(null);
    swipeOffsetRef.current = 0;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';
    isSwipingRef.current = false;
    slideAnimatingRef.current = false;
    slideOffsetRef.current = 0;
    slideDirRef.current = null;
    touchStartRef.current = null;
    touchInteractionRef.current = false;

    prevIndexRef.current = index;
    prevSrcRef.current = current?.src;
  }, [index, current?.src, clearSlideCommitTimer]);

  useLayoutEffect(() => {
    const rapidDirection = rapidNavDirectionRef.current;
    if (rapidDirection === null) return;

    rapidNavDirectionRef.current = null;
    requestAnimationFrame(() => {
      startProgrammaticSlideRef.current(rapidDirection);
    });
  }, [index, current?.src]);

  useEffect(() => {
    if (phase !== 'open') return;

    let blockClick: ((clickEvent: Event) => void) | null = null;

    const clearBlockSwipeClick = () => {
      if (!blockClick) return;
      document.removeEventListener('click', blockClick, true);
      blockClick = null;
    };

    // a swipe ends in a click on whatever is under the finger, which would step or close once more
    const blockSwipeClick = () => {
      clearBlockSwipeClick();
      blockClick = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        clearBlockSwipeClick();
      };
      document.addEventListener('click', blockClick, true);
    };

    const startSlideRelease = (deltaX: number) => {
      const dir: 1 | -1 = deltaX < 0 ? 1 : -1;
      finishSlide(dir, Math.abs(deltaX) > SWIPE_NAV_THRESHOLD && images.length > 1);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || slideAnimatingRef.current) return;
      const touch = event.touches[0];

      touchInteractionRef.current = true;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      swipeAxisRef.current = 'none';
      swipeDeltaXRef.current = 0;
      isSwipingRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartRef.current || event.touches.length !== 1 || slideAnimatingRef.current) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (swipeAxisRef.current === 'none') {
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (images.length <= 1) return;
          swipeAxisRef.current = 'horizontal';
        } else if (deltaY > 0) {
          swipeAxisRef.current = 'vertical';
        } else {
          return;
        }
      }

      if (swipeAxisRef.current === 'horizontal') {
        isSwipingRef.current = true;
        setIsSwiping(true);
        swipeDeltaXRef.current = deltaX;
        const dir: 1 | -1 = deltaX < 0 ? 1 : -1;
        if (slideDirRef.current !== dir) {
          slideDirRef.current = dir;
          setSlideDir(dir);
        }
        slideOffsetRef.current = deltaX;
        setSlideOffset(deltaX);
        event.preventDefault();
        return;
      }

      if (swipeAxisRef.current === 'vertical') {
        isSwipingRef.current = true;
        setIsSwiping(true);
        swipeOffsetRef.current = deltaY;
        setSwipeOffset(deltaY);
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!touchStartRef.current) return;

      const axis = swipeAxisRef.current;
      const wasSwiping = isSwipingRef.current;

      if (wasSwiping && axis === 'horizontal') {
        startSlideRelease(swipeDeltaXRef.current);
        blockSwipeClick();
      } else if (wasSwiping && axis === 'vertical') {
        if (swipeOffsetRef.current > SWIPE_CLOSE_THRESHOLD) {
          // let go of, the image returns to its place on the page from where it was dragged to, or is
          // carried on down off the screen where it has no such place
          const returns = closeRef.current();
          const dismissOffset = returns ? 0 : window.innerHeight;
          swipeOffsetRef.current = dismissOffset;
          setSwipeDismiss(!returns);
          setSwipeOffset(dismissOffset);
        } else {
          swipeOffsetRef.current = 0;
          setSwipeOffset(0);
          blockSwipeClick();
        }
      } else if (axis === 'horizontal' && Math.abs(swipeDeltaXRef.current) > 0) {
        startSlideRelease(swipeDeltaXRef.current);
        blockSwipeClick();
      }

      touchStartRef.current = null;
      swipeAxisRef.current = 'none';
      swipeDeltaXRef.current = 0;
      isSwipingRef.current = false;
      setIsSwiping(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      clearBlockSwipeClick();
    };
  }, [phase, images.length, finishSlide]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  const isOpen = phase === 'open';
  const isClosing = phase === 'closing';
  const swipeBackdropOpacity = swipeOffset > 0 ? Math.max(0, 1 - swipeOffset / 500) : 1;
  const swipeImageOpacity = swipeOffset > 0 ? Math.max(0.35, 1 - swipeOffset / 500) : 1;
  const contentRect = finalRect ? containIn(finalRect, naturalSize) : null;

  const backingBaseStyle: React.CSSProperties = {
    position: 'fixed',
    top: viewportRect?.top,
    left: viewportRect?.left,
    width: viewportRect?.width,
    height: viewportRect?.height,
    zIndex: 9998,
    pointerEvents: 'none'
  };

  // moved between its place on the page and the lightbox, an image is seen all the way; otherwise it fades
  const fadesIn = phase === 'opening' && !opening;
  const fadesOut = isClosing && !closingRect;

  const currentTransition = (isSwiping && !slideAnimating)
    ? 'none'
    : slideAnimating
      ? `transform ${ANIM_MS}ms ${EASING}`
      : swipeDismiss || isClosing
        ? `transform ${ANIM_MS}ms ${EASING}, opacity ${ANIM_MS}ms ${EASING}`
        : phase === 'opening'
          ? `opacity ${ANIM_MS}ms ${EASING}`
          : 'none';

  const currentBackingStyle: React.CSSProperties = {
    ...backingBaseStyle,
    transform: (slideOffset !== 0 || swipeOffset > 0) ? `translate(${slideOffset}px, ${swipeOffset}px)` : undefined,
    opacity: swipeOffset > 0
      ? swipeImageOpacity
      : fadesIn || fadesOut
        ? 0
        : 1,
    transition: currentTransition
  };

  const imageStyle = (rect: Rect | null): React.CSSProperties => ({
    position: 'absolute',
    top: (rect?.top ?? 0) - (viewportRect?.top ?? 0),
    left: (rect?.left ?? 0) - (viewportRect?.left ?? 0),
    width: rect?.width,
    height: rect?.height,
    objectFit: 'contain',
    pointerEvents: 'none'
  });

  // where the image shown is drawn instead of in the middle of the screen: its place on the page, as it opens out of it and closes back into it
  const pageRect = phase === 'opening' ? opening?.rect : closingRect;
  const currentImageStyle = (rect: Rect | null): React.CSSProperties => ({
    ...imageStyle(rect),
    transformOrigin: 'top left',
    transform: rect && pageRect ? moveTo(rect, pageRect) : undefined,
    // set down over its place on the page at once, moved from and to it in time
    transition: phase === 'opening' ? 'none' : `transform ${ANIM_MS}ms ${EASING}`
  });

  const slideWidth = viewportRect?.width ?? 0;
  const neighborIndex = slideDir !== null ? (index + slideDir + images.length) % images.length : null;
  const neighbor = neighborIndex !== null ? images[neighborIndex] : null;
  const neighborBackingStyle: React.CSSProperties = {
    ...backingBaseStyle,
    transform: slideDir !== null ? `translateX(${slideDir * slideWidth + slideOffset}px)` : undefined,
    transition: slideAnimating ? `transform ${ANIM_MS}ms ${EASING}` : 'none'
  };

  const stepZoneStyle = (side: 'prev' | 'next'): React.CSSProperties | undefined => contentRect ? {
    position: 'fixed',
    top: contentRect.top,
    left: side === 'prev' ? contentRect.left : contentRect.left + contentRect.width / 2,
    width: contentRect.width / 2,
    height: contentRect.height,
    zIndex: 9999,
    cursor: side === 'prev' ? 'w-resize' : 'e-resize',
    pointerEvents: isSwiping ? 'none' : 'auto'
  } : undefined;

  const step = (dir: 1 | -1) => (event: React.MouseEvent) => {
    // the tap that ends a touch has done its work as a swipe or is left to close the lightbox
    if (touchInteractionRef.current) {
      touchInteractionRef.current = false;
      return;
    }
    event.stopPropagation();
    startProgrammaticSlide(dir);
  };

  return (
    <div
      ref={containerRef}
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      style={{ touchAction: isOpen ? 'none' : undefined }}
      onClick={() => {
        close();
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: BACKDROP,
          opacity: isOpen ? swipeBackdropOpacity : 0,
          transition: isSwiping ? 'none' : `opacity ${ANIM_MS}ms ${EASING}`,
          pointerEvents: 'none'
        }}
      />
      {/* where an image is fitted: within the middle of the screen, a band left free above and below it */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '70%', height: '80%' }}>
        <div ref={ghostRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {finalRect && viewportRect && neighbor && (
        <div style={neighborBackingStyle} onTransitionEnd={handleSlideTransitionEnd}>
          <img key={`neighbor-${neighborIndex}-${neighbor.src}`} src={neighbor.src} alt={neighbor.alt} style={imageStyle(finalRect)} />
        </div>
      )}

      {finalRect && viewportRect && current && (
        <div style={currentBackingStyle} onTransitionEnd={handleSlideTransitionEnd}>
          <img
            key={`${index}-${current.src}`}
            src={current.src}
            alt={current.alt}
            onLoad={handleImageLoad}
            style={currentImageStyle(contentRect)}
          />
        </div>
      )}

      {isOpen && contentRect && images.length > 1 && (
        <>
          <div data-step="prev" style={stepZoneStyle('prev')} onClick={step(-1)} />
          <div data-step="next" style={stepZoneStyle('next')} onClick={step(1)} />
        </>
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          opacity: isOpen ? 1 : 0,
          transition: `opacity ${ANIM_MS}ms ${EASING}`
        }}
      >
        <div className="image-lightbox-close-row" />
        <button
          type="button"
          className="image-lightbox-close"
          aria-label="Close"
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          onClick={(event) => {
            event.stopPropagation();
            close();
          }}
        >
          <svg viewBox="0 0 17 17" fill="none" aria-hidden="true">
            <path d="M15.959 0.40332L0.402635 15.9597" stroke="currentColor" strokeWidth="1.14" />
            <path d="M15.959 15.9594L0.402635 0.403002" stroke="currentColor" strokeWidth="1.14" />
          </svg>
        </button>
      </div>
    </div>
  );
};
