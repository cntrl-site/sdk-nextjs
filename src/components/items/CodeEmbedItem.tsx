import { getLayoutStyles, CodeEmbedItem as TCodeEmbedItem, AreaAnchor } from '@cntrl-site/sdk';
import { FC, useEffect, useId, useState } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from "../../common/useRegisterResize";
import { useItemAngle } from '../useItemAngle';
import { LinkWrapper } from '../LinkWrapper';
import { useCodeEmbedItem } from './useCodeEmbedItem';
import { getStatesCSS } from '../../utils/getStatesCSS';
import { useStatesClassNames } from '../useStatesClassNames';
import { useStatesTransitions } from '../useStatesTransitions';

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
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams, item.state];
  const statesClassNames = useStatesClassNames(item.id, item.state, 'embed-wrapper');
  useStatesTransitions(ref!, item.state, ['angle', 'blur', 'opacity']);

  useEffect(() => {
    if (!ref) return;
    const scripts = ref.querySelectorAll('script');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      for (const attr of script.getAttributeNames()) {
        newScript.setAttribute(attr, script.getAttribute(attr)!);
      }
      newScript.textContent = script.textContent;
      script.parentNode!.removeChild(script);
      ref.appendChild(newScript);
    }
  }, [item.commonParams.html])

  useEffect(() => {
    if (!ref) return;
    const iframe: HTMLIFrameElement | null = ref.querySelector(`[data-embed="${item.id}"]`);
    if (!iframe) return;
    iframe.srcdoc = item.commonParams.html;
  }, [item.commonParams.html, item.commonParams.iframe, ref]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`embed-wrapper-${item.id} ${statesClassNames}`}
        style={{
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          ...(opacity !== undefined ? { opacity } : {}),
      }}
        ref={setRef}
      >
        {item.commonParams.iframe ? (
          <iframe
            data-embed={item.id}
            className={`embed-${item.id}`}
            style={{
              ...pos,
              border: 'unset'
            }}
          />
        ) : (
          <div
            className={`embed-${item.id}`}
            style={{ ...pos }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
      <JSXStyle id={id}>{`
      .embed-wrapper-${item.id} {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .embed-${item.id} {
        transform: ${item.commonParams.scale ? 'scale(var(--layout-deviation))' : 'none'};
        transform-origin: top left;
        z-index: 1;
        border: none;
      }
      ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams, stateParams], exemplary) => {
        const statesCSS = getStatesCSS(item.id, 'embed-wrapper', ['angle', 'blur', 'opacity'], stateParams);
        return (`
          .embed-wrapper-${item.id} {
            opacity: ${layoutParams.opacity};
            transform: rotate(${area.angle}deg);
            filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
          }
          .embed-${item.id} {
            width: ${item.commonParams.scale ? `${area.width * exemplary}px` : '100%'};
            height: ${item.commonParams.scale ? `${area.height * exemplary}px` : '100%'};
          }
          ${statesCSS}
        `);
      })}
    `}</JSXStyle>
    </LinkWrapper>
  );
};
