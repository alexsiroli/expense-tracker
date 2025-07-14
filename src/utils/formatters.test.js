import { formatCurrency, formatNumber } from './formatters';

describe('formatNumber', () => {
  it('formatta un numero senza simbolo euro', () => {
    expect(formatNumber(1234.56)).toBe("1'234.56");
  });

  it('gestisce numeri piccoli', () => {
    expect(formatNumber(12.3)).toBe("12.30");
  });

  it('gestisce numeri grandi', () => {
    expect(formatNumber(1234567.89)).toBe("1'234'567.89");
  });
});

describe('formatCurrency', () => {
  it('formatta un numero come euro', () => {
    expect(formatCurrency(1234.56)).toBe("€1'234.56");
  });

  it('gestisce numeri piccoli', () => {
    expect(formatCurrency(12.3)).toBe("€12.30");
  });

  it('gestisce numeri grandi', () => {
    expect(formatCurrency(1234567.89)).toBe("€1'234'567.89");
  });
});

describe('formatNumber - edge cases', () => {
  it('gestisce 0', () => {
    expect(formatNumber(0)).toBe("0.00");
  });
  it('gestisce numeri negativi', () => {
    expect(formatNumber(-1234.56)).toBe("-1'234.56");
  });
  it('gestisce numeri molto piccoli', () => {
    expect(formatNumber(0.0001)).toBe("0.00");
  });
  it('gestisce NaN', () => {
    expect(() => formatNumber(NaN)).toThrow();
  });
  it('gestisce undefined', () => {
    expect(() => formatNumber(undefined)).toThrow();
  });
  it('gestisce null', () => {
    expect(() => formatNumber(null)).toThrow();
  });
  it('gestisce stringa', () => {
    expect(() => formatNumber('123')).toThrow();
  });
  it('gestisce oggetto', () => {
    expect(() => formatNumber({})).toThrow();
  });
  it('gestisce array', () => {
    expect(() => formatNumber([1,2,3])).toThrow();
  });
});

describe('formatCurrency - edge cases', () => {
  it('gestisce 0', () => {
    expect(formatCurrency(0)).toBe("€0.00");
  });
  it('gestisce numeri negativi', () => {
    expect(formatCurrency(-1234.56)).toBe("€-1'234.56");
  });
  it('gestisce numeri molto piccoli', () => {
    expect(formatCurrency(0.0001)).toBe("€0.00");
  });
  it('gestisce NaN', () => {
    expect(() => formatCurrency(NaN)).toThrow();
  });
  it('gestisce undefined', () => {
    expect(() => formatCurrency(undefined)).toThrow();
  });
  it('gestisce null', () => {
    expect(() => formatCurrency(null)).toThrow();
  });
  it('gestisce stringa', () => {
    expect(() => formatCurrency('123')).toThrow();
  });
  it('gestisce oggetto', () => {
    expect(() => formatCurrency({})).toThrow();
  });
  it('gestisce array', () => {
    expect(() => formatCurrency([1,2,3])).toThrow();
  });
}); 