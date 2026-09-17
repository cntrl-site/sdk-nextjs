import JSXStyle from 'styled-jsx/style';
import { NavigationComponent as TNavigationComponent, getLayoutStyles, Project } from '@cntrl-site/sdk';
import { FC, useId } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useLayoutContext } from '../useLayoutContext';
import { mergeComponentSettings } from '../../utils/mergeComponentSettings';

interface Props {
  component: TNavigationComponent;
  pages: Array<{ id: string; slug: string }>;
  currentState?: string;
  isSwitchClone?: boolean;
}

export const NavigationComponent: FC<Props> = ({
  component: block,
  pages,
  currentState,
  isSwitchClone
}) => {
  const sdk = useCntrlContext();
  const { layouts } = sdk;
  const layout = useLayoutContext();
  const fallbackLayout = layouts[0]?.id;
  const effectiveLayout = layout ?? fallbackLayout;
  const layoutValues: Record<string, any>[] = [block.layoutParams];
  const component = sdk.getComponent(block.commonParams.componentId);
  const Element = component ? component.element : undefined;
  const layoutParameters = effectiveLayout ? block.layoutParams[effectiveLayout]?.parameters : undefined;
  const commonParameters = block.commonParams.parameters;
  const parameters = layoutParameters ? {
    ...layoutParameters,
    settings: mergeComponentSettings(layoutParameters.settings, commonParameters?.settings)
  } : undefined;
  const reactId = useId();
  const id = `${reactId}-custom-component-${block.id}`;

  return (
    <>
      <div
        className={`custom-component-${block.id}`}
        style={{ opacity: layout == null ? 0 : undefined }}
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
            layoutId={effectiveLayout}
            pages={pages}
            currentState={currentState}
            isSwitchClone={isSwitchClone}
          />
        )}
      </div>
      <JSXStyle id={id}>{`
      .custom-component-${block.id} {
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }
      ${getLayoutStyles(layouts, layoutValues, ([layoutParams]) => {
      return (`
          .custom-component-${block.id} {
            opacity: ${layoutParams.opacity};
            ${layoutParams.blur !== 0 ? `filter: blur(${layoutParams.blur}vw);` : ''}
            ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
          }
        `);
    })}`}
      </JSXStyle>
    </>
  );
};
