import { FC, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  getLayoutStyles,
  Layout,
  ProjectNavigation,
  ProjectNavigationPosition
} from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { mergeComponentSettings } from '../../utils/mergeComponentSettings';
import { useLayoutContext } from '../useLayoutContext';
import { useNavigationSwitch } from './useNavigationSwitch';

interface Props {
  navigation: ProjectNavigation;
  pages: Array<{ id: string; slug: string }>;
}

const DEFAULT_POSITION: ProjectNavigationPosition = 'default';

export const Navigation: FC<Props> = ({ navigation, pages }) => {
  const sdk = useCntrlContext();
  const { layouts } = sdk;
  const layout = useLayoutContext();
  const fallbackLayout = layouts[0]?.id;
  const effectiveLayout = layout ?? fallbackLayout;
  const component = sdk.getComponent(navigation.component.componentId);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const reactId = useId();
  const styleId = `${reactId}-project-navigation-${navigation.id}`;
  const Element = component ? component.element : undefined;
  const layoutParams = effectiveLayout
    ? getClosestLayoutValue(navigation.component.layoutParams, layouts, effectiveLayout)
    : undefined;
  const layoutParameters = layoutParams?.parameters;
  const commonParameters = navigation.component.parameters;
  const parameters = layoutParameters ? {
    ...layoutParameters,
    settings: mergeComponentSettings(layoutParameters.settings, commonParameters?.settings)
  } : undefined;
  const position = getNavigationPosition(navigation, layouts, effectiveLayout);
  const isSwitch = position === 'switch';
  const isSwitchOnScroll = useNavigationSwitch(isSwitch, wrapperRef);
  const burgerPages = useMemo(() => pages.map(page => ({ id: page.id, slug: page.slug })), [pages]);
  const opacity = layoutParams && 'opacity' in layoutParams ? layoutParams.opacity : 1;
  const layoutValues: Record<string, any>[] = [navigation.component.layoutParams];

  if (!Element || !parameters) return null;

  const componentProps = {
    content: navigation.component.content,
    ...parameters,
    layoutId: effectiveLayout,
    portalId: 'component-portal',
    pages: burgerPages
  };

  return (
    <>
      <div
        id={navigation.component.id}
        ref={setWrapperRef}
        className={`project-navigation project-navigation-${navigation.id}${position === 'stickyTop' ? ` project-navigation-${navigation.id}-sticky` : ''}`}
        style={{
          opacity: layout == null ? 0 : opacity
        }}
      >
        <Element
          {...componentProps}
          navigationState={isSwitch ? 'default' : undefined}
        />
      </div>
      {isSwitch && (
        <div
          aria-hidden={!isSwitchOnScroll}
          className={`project-navigation-switch-clone project-navigation-switch-clone-${navigation.id}${isSwitchOnScroll ? ` project-navigation-switch-clone-${navigation.id}-visible` : ''}`}
          style={{
            opacity: layout == null ? 0 : opacity
          }}
        >
          <Element
            {...componentProps}
            isPreviewMode={isSwitchOnScroll}
            navigationState="onScroll"
          />
        </div>
      )}
      <JSXStyle id={styleId}>{`
        .project-navigation-${navigation.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 10000;
        }
        .project-navigation-${navigation.id}-sticky {
          position: fixed;
        }
        .project-navigation-switch-clone-${navigation.id} {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 10001;
          transform: translateY(-100%);
          transition: transform 320ms ease;
          pointer-events: none;
        }
        .project-navigation-switch-clone-${navigation.id}-visible {
          transform: translateY(0);
          pointer-events: auto;
        }
        ${getLayoutStyles(layouts, layoutValues, ([params]) => (`
          .project-navigation-${navigation.id},
          .project-navigation-switch-clone-${navigation.id} {
            opacity: ${params?.opacity ?? 1};
          }
        `))}
      `}</JSXStyle>
    </>
  );
};

function getNavigationPosition(
  navigation: ProjectNavigation,
  layouts: Layout[],
  layoutId: string | undefined
): ProjectNavigationPosition {
  if (!navigation.settings || !layoutId) return DEFAULT_POSITION;
  const settings = getClosestLayoutValue(navigation.settings, layouts, layoutId);
  return settings?.position ?? DEFAULT_POSITION;
}

function getClosestLayoutValue<T>(
  map: Record<string, T>,
  layouts: Layout[],
  layoutId: string
): T | undefined {
  if (Object.prototype.hasOwnProperty.call(map, layoutId)) {
    return map[layoutId];
  }
  const sorted = layouts.slice().sort((a, b) => a.startsWith - b.startsWith);
  const index = sorted.findIndex(layout => layout.id === layoutId);
  if (index === -1) return undefined;
  const order = [
    sorted[index],
    ...sorted.slice(index + 1),
    ...sorted.slice(0, index).reverse()
  ];
  const found = order.find(layout => Object.prototype.hasOwnProperty.call(map, layout.id));
  return found ? map[found.id] : undefined;
}
