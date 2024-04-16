import { ArticleItemType, getLayoutStyles, CodeEmbedItem as TCodeEmbedItem, AreaAnchor } from '@cntrl-site/sdk';
import { FC, useId, useState } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import { getHoverStyles, getTransitions } from '../../utils/HoverStyles/HoverStyles';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useItemAngle } from '../useItemAngle';
import { LinkWrapper } from '../LinkWrapper';
import { useCodeEmbedItem } from './useCodeEmbedItem';

const stylesMap = {
  [AreaAnchor.TopLeft]: {},
  [AreaAnchor.TopCenter]: { justifyContent: 'center' },
  [AreaAnchor.TopRight]: { justifyContent: 'flex-end' },
  [AreaAnchor.MiddleLeft]: { alignItems: 'center' },
  [AreaAnchor.MiddleCenter]: { justifyContent: 'center', alignItems: 'center' },
  [AreaAnchor.MiddleRight]: { justifyContent: 'flex-end', alignItems: 'center' },
  [AreaAnchor.BottomLeft]: { alignItems: 'flex-end' },
  [AreaAnchor.BottomCenter]: { justifyContent: 'center', alignItems: 'flex-end' },
  [AreaAnchor.BottomRight]: { justifyContent: 'flex-end', alignItems: 'flex-end' }
};

export const CodeEmbedItem: FC<ItemProps<TCodeEmbedItem>> = ({ item, sectionId, onResize }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const { anchor, blur, opacity } = useCodeEmbedItem(item, sectionId);
  const angle = useItemAngle(item, sectionId);
  const { html } = item.commonParams;
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const pos = stylesMap[anchor];

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`embed-wrapper-${item.id}`}
        style={{ opacity: `${opacity}`, transform: `rotate(${angle}deg)`, filter: `blur(${blur * 100}vw)`, ...pos}}
        ref={setRef}
      >
        <div className="embed" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
      <JSXStyle id={id}>{`
      .embed-wrapper-${item.id} {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .embed {
        width: 100%;
        height: 100%;
        z-index: 1;
        border: none;
        overflow: hidden;
      }
      ${getLayoutStyles(layouts, [item.state.hover], ([hoverParams]) => {
        return (`
          .embed-wrapper-${item.id} {
            transition: ${getTransitions<ArticleItemType.CodeEmbed>(['angle', 'blur', 'opacity'], hoverParams)};
          }
          .embed-wrapper-${item.id}:hover {
            ${getHoverStyles<ArticleItemType.CodeEmbed>(['angle', 'blur', 'opacity'], hoverParams)}
          }
        `);
      })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
