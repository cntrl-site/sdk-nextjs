import { act, fireEvent, render } from '@testing-library/react';
import { Layout } from '@cntrl-site/sdk';
import { CntrlContext } from '../../provider/CntrlContext';
import { CntrlSdkContext } from '../../provider/CntrlSdkContext';
import { CustomItemRegistry } from '../../provider/CustomItemRegistry';
import { CustomSectionRegistry } from '../../provider/CustomSectionRegistry';
import { ImageLightbox, LightboxImage } from './ImageLightbox';

// the styles the lightbox writes, drawn where it is for the test to read them
jest.mock('styled-jsx/style', () => ({ __esModule: true, default: ({ children }: { children: string | string[] }) => <style>{children}</style> }));

const IMAGES: LightboxImage[] = [
  { src: 'https://cdn.cntrl.site/a.jpg', alt: 'A' },
  { src: 'https://cdn.cntrl.site/b.jpg', alt: 'B' },
  { src: 'https://cdn.cntrl.site/c.jpg', alt: 'C' }
];

const LAYOUTS: Layout[] = [
  { id: 'd', title: 'Desktop', startsWith: 1024, exemplary: 1440 },
  { id: 't', title: 'Tablet', startsWith: 768, exemplary: 768 },
  { id: 'm', title: 'Mobile', startsWith: 0, exemplary: 375 }
];

const FADE_MS = 500;

function open(props: Partial<Parameters<typeof ImageLightbox>[0]> = {}, layouts = LAYOUTS) {
  const sdk = new CntrlSdkContext(new CustomItemRegistry(), new CustomSectionRegistry());
  sdk.setLayouts(layouts);
  return render(
    <CntrlContext.Provider value={sdk}>
      <ImageLightbox images={IMAGES} initialIndex={0} onClose={() => {}} {...props} />
    </CntrlContext.Provider>
  );
}

const lightbox = () => document.querySelector<HTMLElement>('.image-lightbox');
const shown = () => lightbox()?.querySelector('img')?.getAttribute('src');
const stepZone = (side: 'prev' | 'next') => lightbox()!.querySelector<HTMLElement>(`[data-step="${side}"]`);
const css = () => [...document.querySelectorAll('style')].map(style => style.textContent).join('\n');

function step(side: 'prev' | 'next') {
  fireEvent.click(stepZone(side)!);
  act(() => { jest.advanceTimersByTime(1000); });
}

beforeEach(() => {
  jest.useFakeTimers();
  (globalThis as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 0, left: 0, width: 1000, height: 800, right: 1000, bottom: 800, x: 0, y: 0, toJSON: () => ({})
  });
});

afterEach(() => {
  document.getElementById('component-portal')?.remove();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('ImageLightbox', () => {
  it('renders into the page\'s portal for what covers the page', () => {
    const portal = document.createElement('div');
    portal.id = 'component-portal';
    document.body.appendChild(portal);
    open();
    expect(portal.contains(lightbox())).toBe(true);
  });

  it('renders into the body on a page without that portal', () => {
    open();
    expect(lightbox()?.parentElement).toBe(document.body);
  });

  it('opens on the image it is told to', () => {
    open({ initialIndex: 1 });
    expect(shown()).toBe('https://cdn.cntrl.site/b.jpg');
    expect(lightbox()!.querySelector('img')!.alt).toBe('B');
  });

  it('steps forward around from the last image to the first', () => {
    open({ initialIndex: 1 });
    step('next');
    expect(shown()).toBe('https://cdn.cntrl.site/c.jpg');
    step('next');
    expect(shown()).toBe('https://cdn.cntrl.site/a.jpg');
  });

  it('steps back around from the first image to the last', () => {
    open();
    step('prev');
    expect(shown()).toBe('https://cdn.cntrl.site/c.jpg');
  });

  it('has nowhere to step with a single image', () => {
    open({ images: IMAGES.slice(0, 1) });
    expect(shown()).toBe('https://cdn.cntrl.site/a.jpg');
    expect(stepZone('next')).toBeNull();
    expect(stepZone('prev')).toBeNull();
  });

  it.each([
    ['Escape', () => fireEvent.keyDown(window, { key: 'Escape' })],
    ['a click on the backdrop', () => fireEvent.click(lightbox()!)],
    ['the close icon', () => fireEvent.click(document.querySelector('button[aria-label="Close"]')!)]
  ])('closes on %s once it has faded out', (_name, close) => {
    const onClose = jest.fn();
    open({ onClose });
    close();
    expect(onClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(FADE_MS); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('holds the page still while it is up', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = open();
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });

  it('sizes its close icon for each layout, larger on the narrower ones', () => {
    open();
    expect(css()).toMatch(/\.image-lightbox-close \{\s*width: 8\.1vw;/);
    expect(css()).toMatch(/@media \(min-width: 768px\) \{\s*\.image-lightbox-close-row \{\s*height: 2\.6vw;\s*\}\s*\.image-lightbox-close \{\s*width: 3\.90\d+vw;/);
    expect(css()).toMatch(/@media \(min-width: 1024px\) \{\s*\.image-lightbox-close-row \{\s*height: 1vw;\s*\}\s*\.image-lightbox-close \{\s*width: 1\.25vw;/);
  });

  it('sizes its close icon as on the desktop on a layout a project has added', () => {
    open({}, [{ id: 'wide', title: 'Wide', startsWith: 0, exemplary: 1920 }]);
    expect(css()).toMatch(/\.image-lightbox-close \{\s*width: 1\.25vw;/);
  });
});
