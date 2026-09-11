declare module '@cntrl-site/components/utils' {
  export function scalingValue(value: number, isEditor?: boolean): string;
  export function useScopedStyles(): { prefix: string; cls: (name: string) => string };
  export function getColorAlpha(color: string): number;
  export function getPositionStyles(position: any): Record<string, any>;
  export function getImageRect(rect: any): Record<string, any>;
  export function mergeComponentSettings<T extends Record<string, any>>(
    layoutSettings?: T,
    commonSettings?: T,
  ): T;
  export function applyNavigationStateOverrides<T extends Record<string, any>>(
    settings: T,
    state: string | undefined,
  ): T;
  export function isNavigationStateActive(
    state: string | undefined,
    navigationStates?: readonly string[],
  ): state is string;
}
