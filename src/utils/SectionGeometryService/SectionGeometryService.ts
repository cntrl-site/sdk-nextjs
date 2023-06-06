import { EventEmitter } from '../EventEmitter';

interface EventMap {
  'scroll': undefined;
}

export class SectionGeometryService extends EventEmitter<EventMap> {
  private sectionsPos: Map<string, number> = new Map();

  constructor() {
    super();
  }

  initScrollEvent() {
    const handleScroll = () => {

    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }
}
