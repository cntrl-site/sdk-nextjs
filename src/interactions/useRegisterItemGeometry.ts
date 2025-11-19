import { useContext, useEffect } from 'react';
import { ItemGeometryRegisterContext } from './ItemGeometryRegisterContext';

export function useRegisterItemGeometry(itemId?: string, el?: HTMLDivElement | null) {
  const registry = useContext(ItemGeometryRegisterContext);
  useEffect(() => {
    if (!el || !itemId) return;
    return registry.register(itemId, el);
  }, [el, registry, itemId]);
}
