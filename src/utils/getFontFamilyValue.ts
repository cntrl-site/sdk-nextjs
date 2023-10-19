export function getFontFamilyValue(value: string) {
  return value.includes('"') ? value : `"${value}"`;
}
