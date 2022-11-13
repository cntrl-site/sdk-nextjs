import { TCustomItem } from '@cntrl-site/sdk';
import { FC } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ItemProps } from '../Item';

export const CustomItem: FC<ItemProps<TCustomItem>> = ({ item }) => {
  const sdk = useCntrlContext();
  const component = sdk.customItems.get(item.commonParams.name);
  if (!component) return null;
  return component({});
};
