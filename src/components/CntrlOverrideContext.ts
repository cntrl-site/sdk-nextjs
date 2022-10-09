import { createContext } from 'react';
import { CntrlOverrideRegistry } from './CntrlOverrideRegistry.js';

export const CntrlOverrideContext = createContext(new CntrlOverrideRegistry());
