import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import { CntrlOverrideContext } from './CntrlOverrideContext';
import { RenderOverride } from './CntrlOverrideRegistry';

interface ItemOverrideProps {
  articleId: string;
  itemId: string;
  children: RenderOverride;
}

export const ItemOverride: FC<ItemOverrideProps> = ({
  articleId,
  itemId,
  children
}) => {
  const overrideRegistry = useContext(CntrlOverrideContext);
  const renderOverrideRef = useRef<RenderOverride>(children);
  renderOverrideRef.current = children;

  const renderOverride = useCallback<RenderOverride>((props) => {
    return renderOverrideRef.current(props);
  }, []);

  useEffect(() => {
    if (!overrideRegistry) return;
    return overrideRegistry.overrideItem(articleId, itemId, renderOverride);
  }, [articleId, itemId, renderOverride]);

  return null;
};
