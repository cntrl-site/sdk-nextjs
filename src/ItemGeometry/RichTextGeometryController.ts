import { measureFont, Rect } from '@cntrl-site/sdk';
import { ItemGeometryController } from './ItemGeometryController';
import { domDfs } from '../utils/domDfs';
import { formatCSSNumber, parseCSSNumber } from '../utils/CSSNumeric';

export enum SizingType {
  Auto = 'auto',
  Manual = 'manual',
}

interface RichTextGeometryOptions {
  xSizing: SizingType;
}

interface Baseline {
  y: number;
  xEnd: number;
}

type GeomtryRegistry = {
  getControllerById: (itemId: string) => ItemGeometryController;
};

export class RichTextGeometryController implements ItemGeometryController {
  private scale: number = 1;
  private angle: number = 0;
  private options!: RichTextGeometryOptions;
  private parentId?: string;
  private registry: GeomtryRegistry | undefined;
  static parseCssValue(value: string) {
    const parsedLs = Number.parseInt(value);
    return Number.isNaN(parsedLs) ? 0 : parsedLs;
  }

  constructor(
    private container: HTMLElement
  ) { }

  setRegistry(registry: GeomtryRegistry) {
    this.registry = registry;
  }

  getBoundary(isRotatedBoundary?: boolean): Rect {
    const rect = this.container.getBoundingClientRect();
    if (isRotatedBoundary) {
      return Rect.fromObject(rect);
    }
    const angle = this.getAngle();
    if (angle === 0) return Rect.fromObject(rect);
    const styles = getComputedStyle(this.container);
    const ratio = Number.parseInt(styles.width) / Number.parseInt(styles.height);
    return Rect.getOriginRectFromBoundary(rect, angle, ratio);
  }

  getContentGuides(): [boundary: Rect, xs: number[], ys: number[]] {
    const boundary = this.getBoundary();
    const contentXs: Set<number> = new Set();
    const { xSizing } = this.options;
    const contentYs: Set<number> = new Set();
    domDfs(Array.from(this.container.children), (el) => {
      if (el.children.length !== 0) return;
      const rects = el.getClientRects();
      const styles = window.getComputedStyle(el);
      const ls = RichTextGeometryController.parseCssValue(styles.letterSpacing);
      const metrics = measureFont(this.getFontStr(styles), el.textContent?.trim() ?? '');
      const {
        capHeight,
        baseline,
        fontBoxHeight,
        xHeight,
        leftMargin,
        rightMargin
      } = metrics;
      for (let i = 0; i <= rects.length - 1; i += 1) {
        const rect = rects[i];
        const halfLead = (rect.height - fontBoxHeight) / 2;
        contentXs.add(rect.left + leftMargin - boundary.left);
        contentXs.add(rect.right - rightMargin - ls - boundary.left);
        contentYs.add(rect.top + halfLead + baseline - boundary.top); // baseline
        if (i === 0) {
          contentYs.add(rect.top + halfLead + baseline - capHeight - boundary.top); // cap height
        }
        if (rects.length === 1) {
          contentYs.add(rect.top + halfLead + baseline - xHeight - boundary.top); // x-height
        }
      }
    });
    const left = xSizing === SizingType.Auto ? Math.min(...contentXs.values()) : 0;
    const right = xSizing === SizingType.Auto ? Math.max(...contentXs.values()) : boundary.width;
    const center = left + (right - left) / 2;
    return [
      boundary,
      [left, center, right],
      [...Array.from(contentYs.values(), y => y)]
    ];
  }

  setParentId(parentId?: string) {
    this.parentId = parentId;
  }

  getParentId(): string | undefined {
    return this.parentId;
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  setAngle(angle: number) {
    this.angle = angle;
  }

  getContentBoundary(): Rect {
    if (this.getAngle() !== 0) {
      return this.getBoundary(true);
    }
    const [boundary, xs, ys] = this.getContentGuides();
    const left = Math.min(...xs);
    const right = Math.max(...xs);

    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const content = new Rect(
      boundary.left + left,
      boundary.top + top,
      right - left,
      bottom - top
    );
    return content;
  }

  private getBaselines(): Baseline[] {
    const boundary = this.getBoundary();
    const contentBoundary = this.getContentBoundary();
    const offsetY = contentBoundary.top - boundary.top;
    const baselines: Baseline[] = [];
    domDfs(Array.from(this.container.children), (el) => {
      if (el.children.length !== 0) return;
      const rects = el.getClientRects();
      const styles = window.getComputedStyle(el);
      const isTextCentered = styles.textAlign === 'center';
      const ls = RichTextGeometryController.parseCssValue(styles.letterSpacing);
      const metrics = measureFont(this.getFontStr(styles), el.textContent?.trim() ?? '');
      const { baseline, fontBoxHeight, rightMargin } = metrics;
      for (let i = 0; i <= rects.length - 1; i += 1) {
        const rect = rects[i];
        const halfLead = (rect.height - fontBoxHeight) / 2;
        baselines.push({
          xEnd: isTextCentered ? boundary.width : rect.right - rightMargin - ls - boundary.left,
          y: rect.top + halfLead + baseline - boundary.top - offsetY
        });
      }
    });
    return baselines;
  }

  private getFontStr(styles: CSSStyleDeclaration) {
    const fontSize = parseCSSNumber(styles.fontSize);
    const lineHeight = parseCSSNumber(styles.lineHeight);
    const scaledFontSize = formatCSSNumber({
      value: fontSize.value * this.getScale(),
      unit: fontSize.unit
    });
    const scaledLineHeight = formatCSSNumber({
      value: lineHeight.value * this.getScale(),
      unit: lineHeight.unit
    });
    return `${scaledFontSize} / ${scaledLineHeight} ${styles.fontFamily}`;
  }

  setOptions(options?: RichTextGeometryOptions) {
    if (!options) return;
    this.options = options;
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
