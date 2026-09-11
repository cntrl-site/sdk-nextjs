import JSXStyle from 'styled-jsx/style';
import { NavigationComponent as TNavigationComponent, getLayoutStyles } from '@cntrl-site/sdk';
import { FC } from 'react';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useLayoutContext } from '../useLayoutContext';
import { mergeComponentSettings } from '../../utils/mergeComponentSettings';

interface Props {
  component: TNavigationComponent;
  pages: Array<{ id: string; slug: string }>;
  currentState?: string;
  isPreviewMode?: boolean;
}

export const NavigationComponent: FC<Props> = ({
  component,
  pages,
  currentState,
  isPreviewMode
}) => {
  const sdk = useCntrlContext();
  const { layouts } = sdk;
  const layout = useLayoutContext();
  const fallbackLayout = layouts[0]?.id;
  const effectiveLayout = layout ?? fallbackLayout;
  const layoutValues: Record<string, any>[] = [component.layoutParams];
  const resolvedComponent = sdk.getComponent(component.commonParams.componentId);
  const Element = resolvedComponent ? resolvedComponent.element : undefined;
  const layoutParameters = effectiveLayout ? component.layoutParams[effectiveLayout]?.parameters : undefined;
  const commonParameters = component.commonParams.parameters;
  const parameters = layoutParameters ? {
    ...layoutParameters,
    settings: mergeComponentSettings(layoutParameters.settings, commonParameters?.settings)
  } : undefined;

  return (
    <>
      <div
        className={`custom-component-${component.id}`}
        // preventing layout shift while supporting SSG for proper SEO
        style={{ opacity: layout == null ? 0 : undefined }}
      >
        {parameters && Element && (
          <Element
            metadata={{
              itemId: component.id,
              submitUrl: sdk.getSubmitUrl(commonParameters?.pluginConfigId)
            }}
            portalId="component-portal"
            content={component.commonParams.content}
            {...parameters}
            layoutId={effectiveLayout}
            pages={pages}
            currentState={currentState}
            isPreviewMode={isPreviewMode}
          />
        )}
      </div>
      <JSXStyle id={component.id}>{`
      .custom-component-${component.id} {
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }
      ${getLayoutStyles(layouts, layoutValues, ([layoutParams]) => {
      return (`
          .custom-component-${component.id} {
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
