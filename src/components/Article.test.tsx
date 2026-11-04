import { render } from '@testing-library/react';
import { Article as TArticle, Layout, Section, SectionHeightMode } from '@cntrl-site/sdk';
import { CntrlContext } from '../provider/CntrlContext';
import { CntrlSdkContext } from '../provider/CntrlSdkContext';
import { CustomItemRegistry } from '../provider/CustomItemRegistry';
import { CustomSectionRegistry } from '../provider/CustomSectionRegistry';
import { Article } from './Article';

jest.mock('styled-jsx/style', () => ({ __esModule: true, default: () => null }));
// jsdom measures nothing, so a section's height is never observed
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

const layouts: Layout[] = [
  { id: 'desktop', title: 'Desktop', startsWith: 800, exemplary: 1440 },
  { id: 'mobile', title: 'Mobile', startsWith: 0, exemplary: 375 }
];

function section(id: string, type: Section['type']): Section {
  return {
    id,
    type,
    items: [],
    minHeight: Object.fromEntries(layouts.map(layout => [layout.id, { mode: SectionHeightMode.ControlUnits, units: 0.5 }])),
    color: {},
    hidden: {},
    structuredContent: [],
    structuredContentSettings: { paddingBottom: {}, defaultWidth: {} }
  } as unknown as Section;
}

function draw(sections: Section[]) {
  const sdk = new CntrlSdkContext(new CustomItemRegistry(), new CustomSectionRegistry());
  sdk.setLayouts(layouts);
  const article: TArticle = { id: 'article', sections, interactions: {} };
  return render(
    <CntrlContext.Provider value={sdk}>
      <Article article={article} sectionData={{}} />
    </CntrlContext.Provider>
  );
}

const tagOf = (container: HTMLElement, id: string) => container.querySelector(`.section-${id}`)?.tagName;

describe('Article', () => {
  it('draws its first content-based section as the page\'s main content, any other as a section, the rest as they were', () => {
    const { container } = draw([section('intro', 'default'), section('post', 'content-based'), section('more', 'content-based')]);
    expect(tagOf(container, 'intro')).toBe('DIV');
    expect(tagOf(container, 'post')).toBe('MAIN');
    expect(tagOf(container, 'more')).toBe('SECTION');
    expect(container.querySelectorAll('main')).toHaveLength(1);
  });
});
