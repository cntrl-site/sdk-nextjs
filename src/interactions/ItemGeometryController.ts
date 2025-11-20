export interface GeometryControllerCtor {
  new (element: HTMLElement): ItemGeometryController;
}

interface Registry {
  getControllerById(itemId: string): ItemGeometryController;
}

export interface ItemGeometryController {
  getBoundary(): DOMRect;
  setRegistry(regisrty: Registry): void;
  setOptions(options?: unknown): void;
}
