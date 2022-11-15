import { CustomItemRegistry } from './CustomItemRegistry';

export class CntrlSdkContext {
  constructor(
    public readonly customItems: CustomItemRegistry
  ) { }
}
