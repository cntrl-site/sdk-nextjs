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
    // no options
  }

  getAngle(): number {
    return this.angle + this.getParentAngle();
  }

  getScale() {
    return this.scale * this.getParentScale();
  }

  private getParentAngle() {
    if (!this.registry || !this.parentId) return 0;
    const parentController = this.registry.getControllerById(this.parentId);
    return parentController.getAngle();
  }

  getParentScale(): number {
    if (!this.registry || !this.parentId) return 1;
    const parentController = this.registry.getControllerById(this.parentId);
    return parentController.getScale();
  }
}
