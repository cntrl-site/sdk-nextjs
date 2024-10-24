import { useCallback, useState } from 'react';

export function useItemPointerEvents(isParentVisible: boolean) {
  const [allowPointerEvents, setAllowPointerEvents] = useState<boolean>(isParentVisible);
  const handleVisibilityChange = useCallback((isVisible: boolean) => {
    if (!isParentVisible) return;
    setAllowPointerEvents(isVisible);
  }, [isParentVisible]);
  return { allowPointerEvents, handleVisibilityChange };
}
