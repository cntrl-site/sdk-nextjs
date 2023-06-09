import { CustomItemRegistry } from './CustomItemRegistry';
import { TLayout, TTypePresets } from '@cntrl-site/sdk';
import { CustomSectionRegistry } from './CustomSectionRegistry';

export class CntrlSdkContext {
  private _typePresets?: TTypePresets;
  private _layouts: TLayout[] = [];
  constructor(
    public readonly customItems: CustomItemRegistry,
    public readonly customSections: CustomSectionRegistry
  ) {}

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
