import { FC } from 'react';
import { TImageItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item }) => {
  const { radius, strokeWidth, opacity, strokeColor } = useFileItem(item);
  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`image-wrapper-${item.id}`}
          style={{
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`,
            opacity: `${opacity}`,
            borderColor: `${strokeColor}`
          }}
        >
          <img className="image" src={item.commonParams.url} />
        </div>
        <style jsx>{`
         .image-wrapper-${item.id} {
            position: absolute;
            overflow: hidden;
            width: 100%;
            height: 100%;
            border-style: solid;
            box-sizing: border-box;
          }
          .image {
            width: 100%;
            height: 100%;
            opacity: 1;
            object-fit: cover;
            pointer-events: none;
          }
      `}</style>
      </>
    </LinkWrapper>
  );
};
