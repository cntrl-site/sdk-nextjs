import { getLayoutStyles, CustomItem as TCustomItem } from '@cntrl-site/sdk';
import { FC, useState } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useItemAngle } from '../useItemAngle';
import { useStatesClassNames } from '../useStatesClassNames';
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesTransitions } from '../useStatesTransitions';

export const CustomItem: FC<ItemProps<TCustomItem>> = ({ item, onResize, sectionId }) => {
  const sdk = useCntrlContext();
  const { layouts } = useCntrlContext();
  const angle = useItemAngle(item, sectionId);
  const component = sdk.customItems.get(item.commonParams.name);
  const layoutValues: Record<string, any>[] = [item.area, item.state];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const statesClassNames = useStatesClassNames(item.id, item.state, 'custom-component');
  useStatesTransitions(ref, item.state, ['angle'])
  if (!component) return null;
  return (
    <>
      <div
        className={`custom-component-${item.id} ${statesClassNames}`}
        ref={setRef}
        style={{
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
        }}
      >
        {component({})}
      </div>
      <JSXStyle id={item.id}>
        {`${getLayoutStyles(layouts, layoutValues, ([area, stateParams]) => {
          const statesCSS = getStatesCSS(item.id, 'custom-component', ['angle'], stateParams);
          return (`
            .custom-component-${item.id} {
              transform: rotate(${area.angle}deg);
              height: 100%;
              width: 100%;
              position: absolute;
              left: 0;
              top: 0;
            }
            ${statesCSS}
          `);
        })}`}
      </JSXStyle>
    </>);
};
