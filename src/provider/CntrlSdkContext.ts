import { CustomItemRegistry } from './CustomItemRegistry';
import { TLayout, TTypePresets,  } from '@cntrl-site/sdk';


export class CntrlSdkContext {
  public typePresets?: TTypePresets;
  public layouts: TLayout[] = [];
  constructor(
    public readonly customItems: CustomItemRegistry,
  ) {}

  setTypePresets(typePresets: TTypePresets) {
    this.typePresets = typePresets;
  }

  setLayouts(layouts: TLayout[]) {
    this.layouts = layouts;
  }
}
