import { ItemGeometryController } from "./ItemGeometryController";

type GeomtryRegistry = {
  getControllerById: (itemId: string) => ItemGeometryController;
};

export class RichTextGeometryController implements ItemGeometryController {
  private registry: GeomtryRegistry | undefined;

  constructor(
    private container: HTMLElement
  ) {}

  setRegistry(registry: GeomtryRegistry) {
    this.registry = registry;
  }

  getBoundary(): DOMRect {
    const rect = this.container.getBoundingClientRect();
    rect.height = rect.height / 2;
    return rect;
  }

  setOptions(options?: unknown) {
    // add options
  }
}
