import { Rect } from "@cntrl-site/sdk";


export interface GeometryControllerCtor {
  new (element: HTMLElement): ItemGeometryController;
}

interface Registry {
  getControllerById(itemId: string): ItemGeometryController;
}

export interface ItemGeometryController {
  getBoundary(isRotatedBoundary?: boolean): Rect;
  getGuides(): [boundary: Rect, xs: number[], ys: number[]];
  getContentBoundary(isRotatedBoundary?: boolean): Rect;
  isVisible(): boolean;
  getScale(): number;
  setScale(scale: number): void;
  setAngle(angle: number): void;
  setRegistry(regisrty: Registry): void;
  setOptions(options?: unknown): void;
  setParentId(parentId?: string): void;
  getParentId(): string | undefined;
  getAngle(): number;
  getHoverGuides(): [boundary: Rect, yLines?: { y: number, xEnd: number }[]];
}
