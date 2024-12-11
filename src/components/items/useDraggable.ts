import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef
} from 'react';

const INITIAL_STATE: DragState = {
  drag: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  pivotX: 0,
  pivotY: 0,
  lastX: 0,
  lastY: 0
};

export function useDraggable(
  element: HTMLElement | null | undefined,
  dragHandler?: DragHandler,
  isMouseLocked: boolean = false,
  preventDragOnChildren: boolean = false
) {
  const dragStateRef = useRef<DragState>(INITIAL_STATE);
  const prevDragStateRef = useRef<DragState | undefined>();
  const dragHandlerRef = useRef<DragHandler | undefined>();
  const untrackMouseMoveRef = useRef<(() => void) | undefined>();
  const animationFrameRef = useRef<number | undefined>();
  dragHandlerRef.current = dragHandler;

  const setDragState = useCallback<Dispatch<SetStateAction<DragState>>>(
    action => {
      const state = isStateGetter<DragState>(action)
        ? action(dragStateRef.current)
        : action;
      if (!prevDragStateRef.current) {
        prevDragStateRef.current = dragStateRef.current;
      }
      dragStateRef.current = state;
      if (animationFrameRef.current !== undefined) return;
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = undefined;
        dragHandlerRef.current?.(
          dragStateRef.current,
          prevDragStateRef.current
        );
        prevDragStateRef.current = dragStateRef.current;
      });
    },
    []
  );

  const handleMouseMove = useCallback<EventHandler<MouseEvent>>(
    event => {
      event.stopPropagation();
      const el = event.target;
      if (!(el instanceof HTMLElement)) return;
      if (isMouseLocked) {
        el.requestPointerLock();
      }
      setDragState(state => {
        if (!state.drag) {
          const clientRect = el.getBoundingClientRect();
          return {
            drag: true,
            startX: event.clientX,
            startY: event.clientY,
            currentX: event.clientX,
            currentY: event.clientY,
            pivotX: event.clientX - clientRect.x,
            pivotY: event.clientY - clientRect.y,
            lastX: state.lastX,
            lastY: state.lastY
          };
        }
        return {
          ...state,
          currentX: state.currentX + event.movementX,
          currentY: state.currentY + event.movementY
        };
      });
    },
    [isMouseLocked, setDragState, element, preventDragOnChildren]
  );

  const handleMouseUp = useCallback<EventHandler<MouseEvent>>(
    event => {
      event.stopPropagation();
      if (isMouseLocked) {
        document.exitPointerLock();
      }
      setDragState(state => ({
        ...state,
        drag: false,
        lastX: state.currentX - state.startX + state.lastX,
        lastY: state.currentY - state.startY + state.lastY
      }));
      untrackMouseMoveRef.current?.();
    },
    [isMouseLocked, setDragState]
  );

  const handleScroll = useCallback<EventHandler<Event>>((event) => {
    setDragState(state => state);
  }, [setDragState]);

  const trackMouseMove = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove, { capture: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [handleMouseMove, handleMouseUp, handleScroll]);

  const handleMouseDown = useCallback<EventHandler<MouseEvent>>(
    event => {
      event.stopPropagation();
      if (preventDragOnChildren && event.target instanceof Node && element instanceof Node) {
        if (event.target !== element && element.contains(event.target)) return;
      }
      // Ticket: CNTRL-1909
      const selection = document.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
      // the action is allowed only for the left mouse button
      if (event.button !== 0) return;
      untrackMouseMoveRef.current?.();
      untrackMouseMoveRef.current = trackMouseMove();
    },
    [trackMouseMove]
  );

  useEffect(() => {
    if (!element) return;
    const handler = handleMouseDown;
    element.addEventListener('mousedown', handler);
    return () => {
      element.removeEventListener('mousedown', handler);
      untrackMouseMoveRef.current?.();
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [element, handleMouseDown]);
}

interface DragState {
  drag: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  pivotX: number;
  pivotY: number;
  lastX: number;
  lastY: number;
}

type EventHandler<E extends Event> = (event: E) => void;
type DragHandler = (state: DragState, prevState?: DragState) => void;

function isStateGetter<T>(
  action: SetStateAction<T>
): action is (prevState: T) => T {
  return typeof action === 'function';
}
