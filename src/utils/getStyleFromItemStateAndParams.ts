export function getStyleFromItemStateAndParams<T extends string | number>(
  stateValue: string | number | undefined,
  paramsValue: T | undefined
): T | undefined {
  return (stateValue as T) !== undefined
    ? stateValue as T
    : paramsValue;
}
