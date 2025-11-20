import { ItemGeometryController } from "./ItemGeometryController";

type GeomtryRegistry = {
  getControllerById: (itemId: string) => ItemGeometryController;
};

export class GenericGeometryController implements ItemGeometryController {
  private registry: GeomtryRegistry | undefined;

  constructor(
    private container: HTMLElement
  ) {}

  setRegistry(registry: GeomtryRegistry) {
    this.registry = registry;
  }

  getBoundary(): DOMRect {
    const rect = this.container.getBoundingClientRect();
    return rect;
  }

  setOptions(options?: unknown) {
    // no options
  }
}
