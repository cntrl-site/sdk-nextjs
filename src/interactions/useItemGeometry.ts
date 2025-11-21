import { useContext, useEffect, useMemo } from "react";
import { GenericGeometryController } from "./GenericGeometryController";
import { GeometryControllerCtor } from "./ItemGeometryController";
import { ItemGeometryContext } from "./ItemGeometryContext";

export function useItemGeometry<T extends GeometryControllerCtor = typeof GenericGeometryController>(
  itemId: string,
  element?: HTMLElement | null,
  // @ts-ignore TODO TARAS!!!!!!!
  controllerCtor: T = GenericGeometryController,
  options?: any
): InstanceType<T> | undefined {
  const itemGeometryService = useContext(ItemGeometryContext);
  const controller = useMemo(() => {
    if (!element) return undefined;
    return new controllerCtor(element);
  }, [element, controllerCtor, options]);
  useEffect(() => {
    if (!controller) return;
    controller.setOptions(options);
    return itemGeometryService.register(itemId, controller);
  }, [itemGeometryService, itemId, controller]);
  // @ts-ignore
  return controller;
}
