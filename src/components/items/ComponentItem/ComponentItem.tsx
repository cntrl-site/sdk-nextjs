import { ItemProps } from '../Item';
import { ComponentItem as TComponentItem, getLayoutStyles } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useComponentItem } from './useComponentItem';
import { useItemAngle } from '../useItemAngle';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useLayoutContext } from '../../useLayoutContext';

export const ComponentItem: FC<ItemProps<TComponentItem>> = ({ item, sectionId, onResize, interactionCtrl }) => {
  const sdk = useCntrlContext();
  const id = useId();
  const { layouts } = sdk;
  const itemAngle = useItemAngle(item, sectionId);
  const layout = useLayoutContext();
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const component = sdk.getComponent(item.commonParams.componentId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { opacity: itemOpacity } = useComponentItem(item, sectionId);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState(['opacity', 'angle']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  if (!component || !layout) return null;
  const Element = component.element;
  const parameters = item.layoutParams[layout].parameters;
  return (
    <>
      <div
        className={`custom-component-${item.id}`}
        ref={setRef}
        style={{
          ...(opacity !== undefined ? { opacity } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          transition: stateParams?.transition ?? 'none'
        }}
      >
        <Element
          content={item.commonParams.content}
          {...parameters}
        />
      </div>
      <JSXStyle id={id}>
        {`${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          return (`
            .custom-component-${item.id} {
              transform: rotate(${area.angle}deg);
              opacity: ${layoutParams.opacity};
              width: 100%;
              height: 100%;
            }
          `);
        })}`}
      </JSXStyle>
    </>
  );
};
