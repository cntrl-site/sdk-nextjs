let cachedUnit: 'vh' | 'svh' | undefined;

// Inline styles hold a single value, so the CSS fallback-declaration trick
// doesn't apply there — pick the unit at runtime instead.
export function getViewportHeightUnit(): 'vh' | 'svh' {
  if (cachedUnit !== undefined) return cachedUnit;
  if (typeof window === 'undefined') return 'svh';
  const supportsSvh = typeof CSS !== 'undefined' && CSS.supports
    ? CSS.supports('height', '1svh')
    : false;
  cachedUnit = supportsSvh ? 'svh' : 'vh';
  return cachedUnit;
}
