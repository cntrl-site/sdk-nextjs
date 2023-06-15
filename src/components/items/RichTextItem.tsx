import { FC, useEffect, useState } from 'react';
import { TRichTextItem } from '@cntrl-site/sdk';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useItemAngle } from '../useItemAngle';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize }) => {
  const [content, styles, preset] = useRichTextItem(item);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const angle = useItemAngle(item, sectionId);
  const className = preset ? `cntrl-preset-${preset.id}` : undefined;

  useEffect(() => {
    if (!ref || !onResize) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      onResize(entry.target.getBoundingClientRect().height / window.innerWidth);
    });
    observer.observe(ref);
    return () => {
      observer.unobserve(ref);
    };
  }, [ref, onResize]);

  return (
    <>
      <div
        ref={setRef}
        className={className}
        style={{
          transform: `rotate(${angle}deg)`
        }}
      >
        {content}
      </div>
      <JSXStyle id={item.id}>
        {styles}
      </JSXStyle>
    </>
  );
};
