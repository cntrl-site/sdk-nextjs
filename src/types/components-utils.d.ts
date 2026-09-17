declare module '@cntrl-site/components/utils' {
  export function scalingValue(value: number, isEditor?: boolean): string;
  export function useScopedStyles(): { prefix: string; cls: (name: string) => string };
  export function getColorAlpha(color: string): number;
  export function getPositionStyles(position: any): Record<string, any>;
  export function getImageRect(rect: any): Record<string, any>;
}

declare module 'franc-min' {
  function franc(text: string, options?: { minLength?: number; only?: string[]; blacklist?: string[] }): string;
  export = franc;
}
