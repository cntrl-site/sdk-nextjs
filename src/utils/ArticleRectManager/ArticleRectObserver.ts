import { EventEmitter } from '../EventEmitter';

interface EventMap {
  'scroll': undefined;
  'resize': undefined;
}

export class ArticleRectObserver extends EventEmitter<EventMap> {
  private resizeObserver: ResizeObserver;
  private articleWidth: number = 0;
  private scrollPos: number = window.scrollY;
  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(this.handleResize);
  }

  get scroll(): number {
    return this.scrollPos;
  }

  get width(): number {
    return this.articleWidth;
  }

  private setScroll(scroll: number) {
    this.scrollPos = scroll;
  }

  start(el: HTMLElement) {
    this.resizeObserver.observe(el);
    const onScroll = () => {
      this.handleScroll(window.scrollY);
      this.emit('scroll', undefined);
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      this.resizeObserver.unobserve(el);
      window.removeEventListener('scroll', onScroll);
    };
  }

  private handleScroll = (scroll: number) => {
    this.setScroll(scroll / this.articleWidth);
  };

  private handleResize: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    const [entry] = entries;
    if (!entry) return;
    const element = entry.target;
    if (!(element instanceof HTMLElement)) return;
    this.notify(element);
    this.emit('resize', undefined);
  };

  private notify(el: HTMLElement) {
    const elBoundary = el.getBoundingClientRect();
    this.articleWidth = elBoundary.width;
  }
}
