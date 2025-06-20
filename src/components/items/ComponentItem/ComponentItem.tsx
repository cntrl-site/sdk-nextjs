import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { ComponentItem as TComponentItem, getLayoutStyles } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useComponentItem } from './useComponentItem';
import { useItemAngle } from '../useItemAngle';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useLayoutContext } from '../../useLayoutContext';

export const ComponentItem: FC<ItemProps<TComponentItem>> = ({ item, sectionId, onResize, interactionCtrl }) => {
  const sdk = useCntrlContext();
  const { layouts } = sdk;
  const itemAngle = useItemAngle(item, sectionId);
  const layout = useLayoutContext();
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const component = sdk.getComponent(item.commonParams.componentId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { opacity: itemOpacity, blur: itemBlur } = useComponentItem(item, sectionId);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState(['opacity', 'angle', 'blur']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(stateParams?.styles?.blur, itemBlur);
  const Element = component ? component.element : undefined;
  const parameters = layout ? item.layoutParams[layout].parameters : undefined;
  return (
    <>
      <div
        className={`custom-component-${item.id}`}
        ref={setRef}
        style={{
          ...(opacity !== undefined ? { opacity } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg) translateZ(0)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          transition: stateParams?.transition ?? 'none'
        }}
      >
        {parameters && Element && (
          <Element
            content={item.commonParams.content}
            {...parameters}
          />
        )}
      </div>
      <JSXStyle id={item.id}>{`
      .custom-component-${item.id} {
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }
      ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
      return (`
          .custom-component-${item.id} {
            transform: rotate(${area.angle}deg) translateZ(0);
            opacity: ${layoutParams.opacity};
            filter: blur(${layoutParams.blur}vw);
          }
        `);
    })}`}
      </JSXStyle>
    </>
  );
};
