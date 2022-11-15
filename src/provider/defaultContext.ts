import { CntrlSdkContext } from './CntrlSdkContext';
import { CustomItemRegistry } from './CustomItemRegistry';

const customItems = new CustomItemRegistry();

export const cntrlSdkContext = new CntrlSdkContext(customItems);
