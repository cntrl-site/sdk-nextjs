import { CustomItemRegistry } from './CustomItemRegistry';
import { TArticle, TArticleSection, TLayout, TProject, TSectionHeight, TTypePresets } from '@cntrl-site/sdk';
import { CustomSectionRegistry } from './CustomSectionRegistry';

interface SdkContextInitProps {
  typePresets: TTypePresets;
  project: TProject;
  article: TArticle;
}

export class CntrlSdkContext {
  private _typePresets?: TTypePresets;
  private _layouts: TLayout[] = [];
  private sectionHeightMap: Map<string, Record<string, TSectionHeight>> = new Map();
  constructor(
    public readonly customItems: CustomItemRegistry,
    public readonly customSections: CustomSectionRegistry
  ) {}

  async resolveSectionData(sections: TArticleSection[]): Promise<Record<string, any>> {
    const resolvers = sections.map(section => {
      const resolver = section.name ? this.customSections.getResolver(section.name) : undefined;
      if (!resolver) return;
      return {
        name: section.name,
        resolver
      };
    }).filter(isDefined);
    return Object.fromEntries(
      await Promise.all(resolvers.map(async ({ name, resolver }) => [name, await resolver()]))
    );
  }

  init({ project, typePresets, article }: SdkContextInitProps) {
    this.setTypePresets(typePresets);
    this.setLayouts(project.layouts);
    this.setSectionsHeight(article.sections);
  }

  setTypePresets(typePresets: TTypePresets) {
    this._typePresets = typePresets;
  }

  setLayouts(layouts: TLayout[]) {
    this._layouts = layouts;
  }

  setSectionsHeight(sections: TArticleSection[]) {
    for (const section of sections) {
      this.sectionHeightMap.set(section.id, section.height)
    }
  }

  getSectionHeightData(sectionId: string) {
    const sectionHeightData = this.sectionHeightMap.get(sectionId);
    return sectionHeightData;
  }

  get layouts(): TLayout[] {
    return this._layouts;
  }

  get typePresets(): TTypePresets | undefined {
    return this._typePresets;
  }
}

function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined;
}
