import { FC, useId } from 'react';
import JSXStyle from 'styled-jsx/style';

export type TSectionImage = {
  url: string;
  type: 'image';
  size: string;
  position: string;
  offsetX: number | null;
};

interface Props {
  media: TSectionImage;
  sectionId: string;
}

export const SectionImage: FC<Props> = ({ media, sectionId }) => {
  const id = useId();
  const { url, size, position, offsetX } = media;
  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';
  return (
    <>
      <img src={url} className={`image-background-${sectionId}`} />
      <JSXStyle id={id}>{`
         .image-background-${sectionId} {
          object-fit: ${isContainHeight ? 'unset' : size ?? 'cover'};
          width: ${isContainHeight || hasOffsetX ? 'auto' : '100%'};
          height: ${position === 'fixed' ? '100vh' : '100%'};
          transform: ${isContainHeight ? 'translateX(-50%)' : 'none'};
          position: ${position === 'fixed' ? 'sticky' : 'relative'};
          top: ${position === 'fixed' ? '100vh' : 'unset'};
          margin-left: ${isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0')};
          ${offsetX ? 'max-width: 100vw;' : ''}
         }
      `}
      </JSXStyle>
    </>
  );
};
