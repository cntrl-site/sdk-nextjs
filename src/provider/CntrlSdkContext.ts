import { CustomItemRegistry } from './CustomItemRegistry';
import { Article, Section, Layout, Project, SectionHeight } from '@cntrl-site/sdk';
import { components, Component as TComponent } from '@cntrl-site/components';
import { CustomSectionRegistry } from './CustomSectionRegistry';

interface SdkContextInitProps {
  project: Project;
  article: Article;
  customComponents?: Map<string, TComponent>;
}

export class CntrlSdkContext {
  private _layouts: Layout[] = [];
  private _fonts?: Project['fonts'] = undefined;
  private _projectId?: string = undefined;
  private _publicApiBase?: string = undefined;
  private sectionHeightMap: Map<string, Record<string, SectionHeight>> = new Map();
  private components: Map<string, TComponent> = new Map();

  constructor(
    public readonly customItems: CustomItemRegistry,
    public readonly customSections: CustomSectionRegistry
  ) {}

  async resolveSectionData(sections: Section[]): Promise<Record<string, any>> {
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

  init({ project, article, customComponents }: SdkContextInitProps) {
    this._projectId = project.id;
    this.setLayouts(project.layouts);
    this.setComponents(components);
    if (customComponents) {
      this.setCustomComponents(customComponents);
    }
    this.setFonts(project.fonts);
    this.setSectionsHeight(article.sections);
  }

  setPublicApiBase(url: string) {
    this._publicApiBase = url;
  }

  get projectId(): string | undefined {
    return this._projectId;
  }

  get publicApiBase(): string | undefined {
    return this._publicApiBase;
  }

  getSubmitUrl(pluginConfigId: string | undefined): string | undefined {
    if (!this._publicApiBase || !this._projectId || !pluginConfigId) return undefined;
    return `${this._publicApiBase}/projects/${this._projectId}/forms/${pluginConfigId}/submit`;
  }

  setLayouts(layouts: Layout[]) {
    this._layouts = layouts;
  }

  private setComponents(components: TComponent[]) {
    for (const component of components) {
      this.components.set(component.id, component);
    }
  }

  setCustomComponents(customComponents: Map<string, TComponent>) {
    for (const [id, component] of customComponents) {
      this.components.set(id, component);
    }
  }

  private setFonts(fonts: Project['fonts']) {
    this._fonts = fonts;
  }

  setSectionsHeight(sections: Section[]) {
    for (const section of sections) {
      this.sectionHeightMap.set(section.id, section.height);
    }
  }

  getSectionHeightData(sectionId: string) {
    const sectionHeightData = this.sectionHeightMap.get(sectionId);
    return sectionHeightData;
  }

  get layouts(): Layout[] {
    return this._layouts;
  }

  get fonts(): Project['fonts'] | undefined {
    return this._fonts;
  }

  getComponent(id: string): TComponent | undefined {
    return this.components.get(id);
  }
}

function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined;
}
