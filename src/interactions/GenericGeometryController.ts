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
  ) {
    this.setOffsetParent();
  }

  setRegistry(registry: GeomtryRegistry) {
    this.registry = registry;
  }

  setParentId(parentId?: string) {
    this.parentId = parentId;
  }

  getParentId(): string | undefined {
    return this.parentId;
  }

  getBoundary(isRotatedBoundary?: boolean): Rect {
    const rect = this.container.getBoundingClientRect();
    if (isRotatedBoundary) {
      return Rect.fromObject(rect);
    }
    const angle = this.getAngle();
    if (angle === 0) return Rect.fromObject(rect);
    const computedStyles = getComputedStyle(this.container);
    const ratio = Number.parseInt(computedStyles.width) / Number.parseInt(computedStyles.height);
    return Rect.getOriginRectFromBoundary(rect, angle, ratio);
  }

  getRotatedBoundary() {
    const rect = this.container.getBoundingClientRect();
    return Rect.fromObject(rect);
  }

  getRotatedContentBoundary() {
    return this.getRotatedBoundary();
  }

  getGuides(): [boundary: Rect, xs: number[], ys: number[]] {
    const boundary = this.getBoundary(true);
    const xs: number[] = [
      0,
      boundary.width / 2,
      boundary.width
    ];
    const ys: number[] = [
      0,
      boundary.height / 2,
      boundary.height
    ];
    return [boundary, xs, ys];
  }

  getHoverGuides(): [boundary: Rect, yLines?: { y: number, xEnd: number }[]] {
    return [this.getBoundary()];
  }

  getContentBoundary(isRotatedBoundary?: boolean): Rect {
    return this.getBoundary(isRotatedBoundary);
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  setAngle(angle: number) {
    this.angle = angle;
  }

  setOffsetParent() {
    // this.offsetParent = castObject(this.container.offsetParent, HTMLElement);
  }

  isVisible(): boolean {
    const boundary = this.getBoundary();
    const viewport = new Rect(0, 0, window.innerWidth, window.innerHeight);
    const intersection = Rect.intersection(boundary, viewport);
    return intersection.width > 0 && intersection.height > 0;
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
