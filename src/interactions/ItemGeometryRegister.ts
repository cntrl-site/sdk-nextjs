interface ItemGeometryRegisterShape {
  register(itemId: string, el: HTMLDivElement): () => void;
//   getElementRect(sectionId: string): Rect | undefined;
}

export class ItemGeometryRegister implements ItemGeometryRegisterShape {
  private registry: Map<string, HTMLDivElement> = new Map();

  register(itemId: string, el: HTMLDivElement): () => void {
    console.log('register: ', itemId);
    this.registry.set(itemId, el);
    return () => {
      this.registry.delete(itemId);
    };
  }

  getBoundary(itemId: string) {
    const rect = this.registry.get(itemId)?.getBoundingClientRect();
    return rect;
  }

  test() {
    console.log(this.registry);
    console.log(this.registry);
  }
}
