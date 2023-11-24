import { ArticleItemType, getLayoutStyles, CustomItem as TCustomItem } from '@cntrl-site/sdk';
import { FC, useState } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from "../../common/useRegisterResize";

export const CustomItem: FC<ItemProps<TCustomItem>> = ({ item, onResize }) => {
  const sdk = useCntrlContext();
  const { layouts } = useCntrlContext();
  const component = sdk.customItems.get(item.commonParams.name);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  if (!component) return null;
  return (
    <>
      <div className={`custom-component-${item.id}`} ref={setRef}>{component({})}</div>
      <JSXStyle id={item.id}>
        {`${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
          return (`
            .custom-component-${item.id} {
              transition: ${getTransitions<ArticleItemType.Custom>(['angle'], hoverParams)};
            }
            .custom-component-${item.id}:hover {
              ${getHoverStyles<ArticleItemType.Custom>(['angle'], hoverParams)}
            }
          `);
        })}`}
      </JSXStyle>
    </>);
};
