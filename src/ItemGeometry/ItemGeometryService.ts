import { Rect } from '@cntrl-site/sdk';
import { ItemGeometryController } from './ItemGeometryController';

export class ItemGeometryService {
  private registry: Map<string, ItemGeometryController> = new Map();

  register(itemId: string, controller: ItemGeometryController): () => void {
    this.registry.set(itemId, controller);
    controller.setRegistry(this);
    return () => {
      this.registry.delete(itemId);
    };
  }

  getItemBoundary(itemId: string) {
    const controller = this.registry.get(itemId);
    if (!controller) {
      return new Rect(0, 0, 0, 0);
    }
    return controller.getContentBoundary();
  }

  getControllerById(itemId: string): ItemGeometryController {
    const controller = this.registry.get(itemId);
    if (!controller) {
      throw new ReferenceError(`There is no registred contoller for item w/ id ${itemId}`);
    }
    return controller;
  }

  hasItem(itemId: string): boolean {
    return this.registry.has(itemId);
  }
}
