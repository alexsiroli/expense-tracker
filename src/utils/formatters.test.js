import { formatCurrency, formatNumber, getCurrentLocalDate, getCurrentLocalTime, parseLocalDate, compareDatesOnly } from './formatters';

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

describe('Date helper functions', () => {
  describe('getCurrentLocalDate', () => {
    it('restituisce la data corrente nel formato YYYY-MM-DD', () => {
      const result = getCurrentLocalDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('getCurrentLocalTime', () => {
    it('restituisce l\'ora corrente nel formato HH:MM', () => {
      const result = getCurrentLocalTime();
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      
      const now = new Date();
      const expected = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('parseLocalDate', () => {
    it('converte una stringa data nel formato YYYY-MM-DD in un oggetto Date', () => {
      const dateString = '2024-07-20';
      const result = parseLocalDate(dateString);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(6); // Luglio è mese 6 (0-based)
      expect(result.getDate()).toBe(20);
    });

    it('gestisce correttamente le date con zeri iniziali', () => {
      const dateString = '2024-01-05';
      const result = parseLocalDate(dateString);
      
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // Gennaio è mese 0
      expect(result.getDate()).toBe(5);
    });
  });

  describe('compareDatesOnly', () => {
    it('confronta correttamente due date ignorando l\'ora', () => {
      const date1 = new Date(2024, 6, 20, 10, 30); // 20 luglio 2024, 10:30
      const date2 = new Date(2024, 6, 20, 15, 45); // 20 luglio 2024, 15:45
      
      expect(compareDatesOnly(date1, date2)).toBe(0); // Stessa data
    });

    it('restituisce -1 quando la prima data è precedente', () => {
      const date1 = new Date(2024, 6, 19); // 19 luglio 2024
      const date2 = new Date(2024, 6, 20); // 20 luglio 2024
      
      expect(compareDatesOnly(date1, date2)).toBeLessThan(0);
    });

    it('restituisce 1 quando la prima data è successiva', () => {
      const date1 = new Date(2024, 6, 21); // 21 luglio 2024
      const date2 = new Date(2024, 6, 20); // 20 luglio 2024
      
      expect(compareDatesOnly(date1, date2)).toBeGreaterThan(0);
    });

    it('gestisce correttamente le date con ore diverse', () => {
      const date1 = new Date(2024, 6, 20, 23, 59); // 20 luglio 2024, 23:59
      const date2 = new Date(2024, 6, 21, 0, 1);   // 21 luglio 2024, 00:01
      
      expect(compareDatesOnly(date1, date2)).toBeLessThan(0); // date1 < date2
    });
  });
}); 