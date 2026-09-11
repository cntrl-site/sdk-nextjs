import { FC, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import {
  getLayoutStyles,
  ProjectNavigation,
  ProjectNavigationPosition
} from '@cntrl-site/sdk';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useLayoutContext } from '../useLayoutContext';
import { NavigationComponent } from './NavigationComponent';
import { useNavigationSwitch } from './useNavigationSwitch';

interface Props {
  navigation: ProjectNavigation;
  pages: Array<{ id: string; slug: string }>;
  hidden?: Record<string, boolean>;
}

const DEFAULT_POSITION: ProjectNavigationPosition = 'default';

export const Navigation: FC<Props> = ({ navigation, pages, hidden }) => {
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const reactId = useId();
  const id = `${reactId}-project-navigation-${navigation.id}`;
  const position = (layout && navigation.settings?.[layout]?.position) ?? DEFAULT_POSITION;
  const isSwitch = position === 'switch';
  const isSwitchOnScroll = useNavigationSwitch(isSwitch, wrapperRef);
  const layoutValues: Record<string, any>[] = [navigation.settings ?? {}, hidden ?? {}];

  return (
    <>
      <div
        id={navigation.component.id}
        ref={setWrapperRef}
        className={`project-navigation-${navigation.id}`}
      >
        <NavigationComponent
          component={navigation.component}
          pages={pages}
          currentState={isSwitch ? 'default' : undefined}
        />
      </div>
      {isSwitch && (
        <div
          aria-hidden={!isSwitchOnScroll}
          className={`project-navigation-switch-clone-${navigation.id}${isSwitchOnScroll ? ` project-navigation-switch-clone-${navigation.id}-visible` : ''}`}
        >
          <NavigationComponent
            component={navigation.component}
            pages={pages}
            currentState="compact"
            isPreviewMode={isSwitchOnScroll}
          />
        </div>
      )}
      <JSXStyle id={id}>{`
        .project-navigation-${navigation.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 10000;
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
        ${getLayoutStyles(layouts, layoutValues, ([settings, isHidden]) => {
          const layoutPosition = settings?.position ?? DEFAULT_POSITION;
          return (`
            .project-navigation-${navigation.id} {
              position: ${layoutPosition === 'stickyTop' ? 'fixed' : 'absolute'};
              display: ${isHidden ? 'none' : 'block'};
            }
            .project-navigation-switch-clone-${navigation.id} {
              display: ${isHidden || layoutPosition !== 'switch' ? 'none' : 'block'};
            }
          `);
        })}
      `}</JSXStyle>
    </>
  );
};
