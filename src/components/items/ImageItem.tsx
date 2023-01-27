import { FC } from 'react';
import { getLayoutStyles, TImageItem } from '@cntrl-site/sdk';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useFileItem } from './useFileItem';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item }) => {
  const { layouts } = useCntrlContext();
  const { radius, strokeWidth } = useFileItem(item);
  return (
    <LinkWrapper url={item.link?.url}>
      <>
        <div className={`image-wrapper-${item.id}`}
          style={{
            borderRadius: `${radius * 100}vw`,
            borderWidth: `${strokeWidth * 100}vw`
          }}
        >
          <img className="image" src={item.commonParams.url} />
        </div>
        <style jsx>{`
        ${getLayoutStyles(layouts, [item.layoutParams], ([{ strokeColor, opacity }]) => (`
           .image-wrapper-${item.id} {
              position: absolute;
              overflow: hidden;
              width: 100%;
              height: 100%;
              border-style: solid;
              box-sizing: border-box;
              border-color: ${strokeColor};
              opacity: ${opacity};
            }`
        ))
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
