import { Rect } from '@cntrl-site/sdk';

export interface GeometryControllerCtor {
  new (element: HTMLElement): ItemGeometryController;
}

interface Registry {
  getControllerById(itemId: string): ItemGeometryController;
}

export interface ItemGeometryController {
  getBoundary(isRotatedBoundary?: boolean): Rect;
  getContentBoundary(isRotatedBoundary?: boolean): Rect;
  getScale(): number;
  setScale(scale: number): void;
  setAngle(angle: number): void;
  setRegistry(regisrty: Registry): void;
  setOptions(options?: unknown): void;
  setParentId(parentId?: string): void;
  getParentId(): string | undefined;
  getAngle(): number;
}
