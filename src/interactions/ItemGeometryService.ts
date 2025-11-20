import { ItemGeometryController } from "./ItemGeometryController";

export class ItemGeometryService {
  private registry: Map<string, ItemGeometryController> = new Map();

  register(itemId: string, controller: ItemGeometryController): () => void {
    // console.log(itemId, controller);
    this.registry.set(itemId, controller);
    controller.setRegistry(this);
    return () => {
      this.registry.delete(itemId);
    };
  }

  getItemBoundary(itemId: string) {
    const controller = this.registry.get(itemId);
    if (!controller) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    return controller.getBoundary();
  }


  getControllerById(itemId: string): ItemGeometryController {
    const controller = this.registry.get(itemId);
    if (!controller) {
      throw new ReferenceError(`There is no registred contoller for item w/ id ${itemId}`);
    }
    return controller;
  }
}
