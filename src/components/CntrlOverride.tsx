import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { CntrlOverrideContext } from './CntrlOverrideContext.js';
import { CntrlOverrideRegistry } from './CntrlOverrideRegistry.js';

export const CntrlOverride: FC<PropsWithChildren<{}>> = ({ children }) => {
  const overrideRegistry = useMemo(() => new CntrlOverrideRegistry(), []);

  return (
    <CntrlOverrideContext.Provider value={overrideRegistry}>
      {children}
    </CntrlOverrideContext.Provider>
  );
};
