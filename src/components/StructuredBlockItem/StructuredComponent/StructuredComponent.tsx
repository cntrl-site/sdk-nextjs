import JSXStyle from 'styled-jsx/style';
import { StructuredBlock, StructuredBlockType, getLayoutStyles } from '@cntrl-site/sdk';
import { FC, useState } from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useLayoutContext } from '../../useLayoutContext';
import { useItemGeometry } from '../../../ItemGeometry/useItemGeometry';

interface Props {
  block: StructuredBlock<StructuredBlockType.Component>;
}

export const StructuredComponent: FC<Props> = ({ block }) => {
  const sdk = useCntrlContext();
  const { layouts } = sdk;
  const layout = useLayoutContext();
  const fallbackLayout = layouts[0]?.id;
  const effectiveLayout = layout ?? fallbackLayout;
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  const component = sdk.getComponent(block.commonParams.componentId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useItemGeometry(block.id, ref);
  const Element = component ? component.element : undefined;
  const layoutParameters = effectiveLayout ? block.layoutParams[effectiveLayout]?.parameters : undefined;
  const commonParameters = block.commonParams.parameters;
  const parameters = layoutParameters ? {
    ...layoutParameters,
    settings: { ...layoutParameters.settings, ...commonParameters?.settings }
  } : undefined;

  return (
    <>
      <div
        className={`custom-component-${block.id}`}
        ref={setRef}
      >
        {parameters && Element && (
          <Element
            metadata={{
              itemId: block.id,
              submitUrl: sdk.getSubmitUrl(commonParameters?.pluginConfigId)
            }}
            portalId="component-portal"
            content={block.commonParams.content}
            {...parameters}
          />
        )}
      </div>
      <JSXStyle id={block.id}>{`
      .custom-component-${block.id} {
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }
      ${getLayoutStyles(layouts, layoutValues, ([layoutParams]) => {
      return (`
          .custom-component-${block.id} {
            opacity: ${layoutParams.opacity};
            filter: blur(${layoutParams.blur}vw);
            ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
          }
        `);
    })}`}
      </JSXStyle>
    </>
  );
};
