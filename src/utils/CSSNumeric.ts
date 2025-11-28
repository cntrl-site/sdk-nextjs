const reCSSNumeric = /([+-]?(?:\d*\.\d|\d)\d*)(\w+)/;

interface CSSNumberValue {
  value: number;
  unit?: string;
}

export function parseCSSNumber(input: string): CSSNumberValue {
  const match = reCSSNumeric.exec(input);
  if (!match) return { value: Number.NaN };
  return {
    value: Number.parseFloat(match[1]),
    unit: match[2]
  };
}

export function formatCSSNumber(input: CSSNumberValue): string {
  return `${input.value}${input.unit ?? ''}`;
}
