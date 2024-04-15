import { ArticleItemType, getLayoutStyles, CustomItem as TCustomItem } from '@cntrl-site/sdk';
import { FC, useState } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useItemAngle } from '../useItemAngle';

export const CustomItem: FC<ItemProps<TCustomItem>> = ({ item, onResize, sectionId }) => {
  const sdk = useCntrlContext();
  const { layouts } = useCntrlContext();
  const angle = useItemAngle(item, sectionId);
  const component = sdk.customItems.get(item.commonParams.name);
  const layoutValues: Record<string, any>[] = [item.area, item.state.hover];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  if (!component) return null;
  return (
    <>
      <div
        className={`custom-component-${item.id}`}
        ref={setRef}
        style={{
          ...(angle !== undefined  ? {transform: `rotate(${angle}deg)`} : {}),
        }}
      >
        {component({})}
      </div>
      <JSXStyle id={item.id}>
        {`${getLayoutStyles(layouts, layoutValues, ([area, hoverParams]) => {
          return (`
            .custom-component-${item.id} {
              transform: rotate(${area.angle}deg);
              transition: ${getTransitions<ArticleItemType.Custom>(['angle'], hoverParams)};
              height: 100%;
              width: 100%;
              position: absolute;
              left: 0;
              top: 0;
            }
            .custom-component-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Custom>(['angle'], hoverParams)};
            }
          `);
        })}`}
      </JSXStyle>
    </>);
};
