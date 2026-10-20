import { ComponentType, useEffect, useState } from 'react';
import { getComponentElement, hasComponentElement, loadComponentElement } from '@cntrl-site/components/elements';
import { useCntrlContext } from '../provider/useCntrlContext';

type ComponentElement = {
  Element: ComponentType<any> | undefined;
  isPending: boolean;
};

export const pendingElementProps = {
  dangerouslySetInnerHTML: { __html: '' },
  suppressHydrationWarning: true
};

export function useComponentElement(componentId: string): ComponentElement {
  const sdk = useCntrlContext();
  const [, setLoadedId] = useState<string | undefined>(undefined);
  const Element = sdk.getComponent(componentId)?.element ?? getComponentElement(componentId);
  const isPending = !Element && hasComponentElement(componentId);
  if (isPending) {
    loadComponentElement(componentId).catch(() => undefined);
  }

  useEffect(() => {
    if (!isPending) return;
    let cancelled = false;
    loadComponentElement(componentId)
      .then(() => {
        if (!cancelled) setLoadedId(componentId);
      })
      .catch((error) => {
        console.error(`Failed to load component "${componentId}":`, error);
      });
    return () => {
      cancelled = true;
    };
  }, [componentId, isPending]);

  return { Element, isPending };
}
