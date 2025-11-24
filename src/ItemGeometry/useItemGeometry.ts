import { useContext, useEffect, useMemo } from "react";
import { GenericGeometryController } from "./GenericGeometryController";
import { GeometryControllerCtor } from "./ItemGeometryController";
import { ItemGeometryContext } from "./ItemGeometryContext";

export function useItemGeometry<T extends GeometryControllerCtor = typeof GenericGeometryController>(
  itemId: string,
  element?: HTMLElement | null,
  // @ts-ignore
  controllerCtor: T = GenericGeometryController,
  options?: any
): InstanceType<T> | undefined {
  const itemGeometryService = useContext(ItemGeometryContext);
  const controller = useMemo(() => {
    if (!element) return undefined;
    return new controllerCtor(element);
  }, [element, controllerCtor]);
  useEffect(() => {
    if (!controller) return;
    controller.setOptions(options);
    return itemGeometryService.register(itemId, controller);
  }, [itemGeometryService, itemId, controller]);

  useEffect(() => {
    return () => {
      console.log('element unmount');
    };
  }, [element]);

  useEffect(() => {
    return () => {
      console.log('controllerCtor unmount');
    };
  }, [controllerCtor]);

  // @ts-ignore
  return controller;
}
