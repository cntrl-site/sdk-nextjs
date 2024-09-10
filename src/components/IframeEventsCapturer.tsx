import { FC, PropsWithChildren, ReactElement } from 'react';

interface Props {
  children: ReactElement<HTMLIFrameElement>;
}

export const IframeEventsCapturer: FC<Props> = ({ children }) => {
  if (children.type !== 'iframe') {
    throw new Error('IframeEventsCapturer can only accept iframe as a child');
  }
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    }}>
      {children}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }} />
    </div>
  );
};
