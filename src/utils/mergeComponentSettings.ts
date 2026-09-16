export function mergeComponentSettings<T extends Record<string, any>>(
  layoutSettings?: T,
  commonSettings?: T,
): T {
  return {
    ...(layoutSettings ?? {} as T),
    ...(commonSettings ?? {} as T)
  };
}
