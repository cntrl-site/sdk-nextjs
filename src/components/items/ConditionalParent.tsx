import { ComponentType, FC, PropsWithChildren, ReactNode, } from 'react';

interface Props {
  WrapperComponent: ComponentType<{ children: ReactNode }>;
  condition?: boolean;
}

export const ConditionalParent: FC<PropsWithChildren<Props>> = ({ condition = false, children, WrapperComponent }) => {
  return condition ? <WrapperComponent>{children}</WrapperComponent> : <>{children}</>;
}
