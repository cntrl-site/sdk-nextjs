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
      <div className={`section-image-wrapper-${sectionId}`}>
        <img src={url} className={`image-background-${sectionId}`} />
      </div>
      <JSXStyle id={id}>{`
        .section-image-wrapper-${sectionId} {
          position: ${position === 'fixed' ? 'sticky' : 'relative'};
          height: ${position === 'fixed' ? '100vh' : '100%'};
          top: ${position === 'fixed' ? '100vh' : '0'};
          width: 100%;
          overflow: hidden;
        }
         .image-background-${sectionId} {
          object-fit: ${isContainHeight ? 'unset' : size ?? 'cover'};
          width: ${isContainHeight || hasOffsetX ? 'auto' : '100%'};
          transform: ${isContainHeight ? 'translateX(-50%)' : 'none'};
          position: relative;
          left: ${isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0')};
          height: 100%;
          ${offsetX ? 'max-width: 100vw;' : ''}
         }
      `}
      </JSXStyle>
    </>
  );
};
