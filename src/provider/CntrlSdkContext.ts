import { CustomItemRegistry } from './CustomItemRegistry';
import { TArticleSection, TLayout, TTypePresets } from '@cntrl-site/sdk';
import { CustomSectionRegistry } from './CustomSectionRegistry';

export class CntrlSdkContext {
  private _typePresets?: TTypePresets;
  private _layouts: TLayout[] = [];
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

  setTypePresets(typePresets: TTypePresets) {
    this._typePresets = typePresets;
  }

  setLayouts(layouts: TLayout[]) {
    this._layouts = layouts;
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
