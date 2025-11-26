import { Rect } from '@cntrl-site/sdk';
import { ItemGeometryController } from './ItemGeometryController';

type GeomtryRegistry = {
  getControllerById: (itemId: string) => ItemGeometryController;
};

export class GenericGeometryController implements ItemGeometryController {
  private scale: number = 1;
  private parentId?: string;
  private offsetParent: HTMLElement | null = null;
  private angle: number = 0;
  private registry: GeomtryRegistry | undefined;

  constructor(
    private container: HTMLElement
  ) { }

  setRegistry(registry: GeomtryRegistry) {
    this.registry = registry;
  }

  setParentId(parentId?: string) {
    this.parentId = parentId;
  }

  getParentId(): string | undefined {
    return this.parentId;
  }

  getBoundary(): Rect {
    const rect = this.container.getBoundingClientRect();
    return Rect.fromObject(rect);
  }

  getContentBoundary(): Rect {
    return this.getBoundary();
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  setAngle(angle: number) {
    this.angle = angle;
  }

  setOptions(options?: unknown) {

  }

  getAngle(): number {
    return 0;
  }

  getScale() {
    return 1;
  }
}
