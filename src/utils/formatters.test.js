import { formatCurrency, formatNumber, getCurrentLocalDate, getCurrentLocalTime, parseLocalDate, compareDatesOnly, getCurrentRomeTime } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formatta correttamente numeri interi', () => {
      expect(formatCurrency(1000)).toBe("€1'000.00");
      expect(formatCurrency(50)).toBe("€50.00");
      expect(formatCurrency(0)).toBe("€0.00");
    });

    it('formatta correttamente numeri decimali', () => {
      expect(formatCurrency(1000.50)).toBe("€1'000.50");
      expect(formatCurrency(50.99)).toBe("€50.99");
      expect(formatCurrency(0.01)).toBe("€0.01");
    });

    it('gestisce correttamente i separatori delle migliaia', () => {
      expect(formatCurrency(1000000)).toBe("€1'000'000.00");
      expect(formatCurrency(1234567.89)).toBe("€1'234'567.89");
    });

    it('lancia errore per valori non numerici', () => {
      expect(() => formatCurrency(NaN)).toThrow('amount must be a finite number');
      expect(() => formatCurrency(Infinity)).toThrow('amount must be a finite number');
      expect(() => formatCurrency(-Infinity)).toThrow('amount must be a finite number');
    });

    it('lancia errore per tipi non numerici', () => {
      expect(() => formatCurrency('100')).toThrow('amount must be a finite number');
      expect(() => formatCurrency(null)).toThrow('amount must be a finite number');
      expect(() => formatCurrency(undefined)).toThrow('amount must be a finite number');
    });
  });

  describe('formatNumber', () => {
    it('formatta correttamente numeri interi senza simbolo euro', () => {
      expect(formatNumber(1000)).toBe("1'000.00");
      expect(formatNumber(50)).toBe("50.00");
      expect(formatNumber(0)).toBe("0.00");
    });

    it('formatta correttamente numeri decimali senza simbolo euro', () => {
      expect(formatNumber(1000.50)).toBe("1'000.50");
      expect(formatNumber(50.99)).toBe("50.99");
      expect(formatNumber(0.01)).toBe("0.01");
    });

    it('gestisce correttamente i separatori delle migliaia', () => {
      expect(formatNumber(1000000)).toBe("1'000'000.00");
      expect(formatNumber(1234567.89)).toBe("1'234'567.89");
    });

    it('lancia errore per valori non numerici', () => {
      expect(() => formatNumber(NaN)).toThrow('amount must be a finite number');
      expect(() => formatNumber(Infinity)).toThrow('amount must be a finite number');
      expect(() => formatNumber(-Infinity)).toThrow('amount must be a finite number');
    });
  });

  describe('getCurrentLocalDate', () => {
    it('restituisce la data corrente in formato YYYY-MM-DD', () => {
      const result = getCurrentLocalDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('restituisce una data valida', () => {
      const result = getCurrentLocalDate();
      const dateParts = result.split('-');
      expect(dateParts.length).toBe(3);
      
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      
      expect(year).toBeGreaterThan(2000);
      expect(year).toBeLessThan(2100);
      expect(month).toBeGreaterThan(0);
      expect(month).toBeLessThan(13);
      expect(day).toBeGreaterThan(0);
      expect(day).toBeLessThan(32);
    });
  });

  describe('getCurrentLocalTime', () => {
    it('restituisce l\'ora corrente in formato HH:MM', () => {
      const result = getCurrentLocalTime();
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('restituisce un orario valido', () => {
      const result = getCurrentLocalTime();
      const timeParts = result.split(':');
      expect(timeParts.length).toBe(2);
      
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(60);
    });
  });

  describe('getCurrentRomeTime', () => {
    it('restituisce l\'orario corrente di Roma come oggetto Date', () => {
      const result = getCurrentRomeTime();
      expect(result).toBeInstanceOf(Date);
    });

    it('restituisce un oggetto Date valido e utilizzabile', () => {
      const result = getCurrentRomeTime();
      
      // Verifica che l'oggetto Date sia valido
      expect(result.getFullYear()).toBeGreaterThan(2000);
      expect(result.getFullYear()).toBeLessThan(2100);
      expect(result.getMonth()).toBeGreaterThanOrEqual(0);
      expect(result.getMonth()).toBeLessThan(12);
      expect(result.getDate()).toBeGreaterThan(0);
      expect(result.getDate()).toBeLessThan(32);
      expect(result.getHours()).toBeGreaterThanOrEqual(0);
      expect(result.getHours()).toBeLessThan(24);
      expect(result.getMinutes()).toBeGreaterThanOrEqual(0);
      expect(result.getMinutes()).toBeLessThan(60);
    });

    it('può essere utilizzato per calcoli temporali', () => {
      const romeTime = getCurrentRomeTime();
      const oneHourLater = new Date(romeTime.getTime() + 60 * 60 * 1000);
      
      expect(oneHourLater.getTime()).toBeGreaterThan(romeTime.getTime());
      expect(oneHourLater.getTime() - romeTime.getTime()).toBe(60 * 60 * 1000);
    });
  });

  describe('parseLocalDate', () => {
    it('converte correttamente stringhe di data in oggetti Date', () => {
      const result = parseLocalDate('2023-06-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(5); // Giugno (0-based)
      expect(result.getDate()).toBe(15);
    });

    it('gestisce correttamente date con zeri iniziali', () => {
      const result = parseLocalDate('2023-01-01');
      expect(result.getMonth()).toBe(0); // Gennaio (0-based)
      expect(result.getDate()).toBe(1);
    });

    it('gestisce correttamente date di fine mese', () => {
      const result = parseLocalDate('2023-02-28');
      expect(result.getMonth()).toBe(1); // Febbraio (0-based)
      expect(result.getDate()).toBe(28);
    });

    it('gestisce correttamente anni bisestili', () => {
      const result = parseLocalDate('2024-02-29');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // Febbraio (0-based)
      expect(result.getDate()).toBe(29);
    });

    it('lancia errore per date non valide', () => {
      expect(() => parseLocalDate('')).toThrow();
    });
  });

  describe('compareDatesOnly', () => {
    it('confronta correttamente date ignorando l\'ora', () => {
      const date1 = new Date('2023-06-15T10:00:00.000Z');
      const date2 = new Date('2023-06-15T18:00:00.000Z');
      const date3 = new Date('2023-06-16T09:00:00.000Z');
      
      expect(compareDatesOnly(date1, date2)).toBe(0); // Stesso giorno
      expect(compareDatesOnly(date1, date3)).toBeLessThan(0); // date1 < date3
      expect(compareDatesOnly(date3, date1)).toBeGreaterThan(0);  // date3 > date1
    });

    it('gestisce correttamente date con orari diversi', () => {
      // Usa date locali per evitare problemi con UTC
      const morning = new Date(2023, 5, 15, 8, 0, 0);  // 15 giugno 2023, 8:00
      const evening = new Date(2023, 5, 15, 22, 0, 0); // 15 giugno 2023, 22:00
      const midnight = new Date(2023, 5, 15, 0, 0, 0); // 15 giugno 2023, 0:00
      
      // Tutte le date sono dello stesso giorno, quindi dovrebbero restituire 0
      expect(compareDatesOnly(morning, evening)).toBe(0);
      expect(compareDatesOnly(evening, midnight)).toBe(0);
      expect(compareDatesOnly(midnight, morning)).toBe(0);
    });

    it('confronta correttamente date di giorni diversi', () => {
      const today = new Date('2023-06-15T12:00:00.000Z');
      const yesterday = new Date('2023-06-14T12:00:00.000Z');
      const tomorrow = new Date('2023-06-16T12:00:00.000Z');
      
      expect(compareDatesOnly(today, yesterday)).toBeGreaterThan(0);  // Oggi > ieri
      expect(compareDatesOnly(today, tomorrow)).toBeLessThan(0);  // Oggi < domani
      expect(compareDatesOnly(yesterday, tomorrow)).toBeLessThan(0); // Ieri < domani
    });

    it('gestisce correttamente date con millisecondi diversi', () => {
      const date1 = new Date('2023-06-15T12:00:00.000Z');
      const date2 = new Date('2023-06-15T12:00:00.001Z');
      
      expect(compareDatesOnly(date1, date2)).toBe(0); // Stesso giorno
    });

    it('gestisce correttamente date con secondi diversi', () => {
      const date1 = new Date('2023-06-15T12:00:00.000Z');
      const date2 = new Date('2023-06-15T12:00:59.000Z');
      
      expect(compareDatesOnly(date1, date2)).toBe(0); // Stesso giorno
    });
  });

  describe('Integrazione tra funzioni', () => {
    it('getCurrentLocalDate e getCurrentLocalTime restituiscono formati validi', () => {
      const date = getCurrentLocalDate();
      const time = getCurrentLocalTime();
      
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(time).toMatch(/^\d{2}:\d{2}$/);
    });

    it('getCurrentRomeTime può essere utilizzato per creare date locali', () => {
      const romeTime = getCurrentRomeTime();
      const localDate = `${romeTime.getFullYear()}-${String(romeTime.getMonth() + 1).padStart(2, '0')}-${String(romeTime.getDate()).padStart(2, '0')}`;
      const localTime = `${String(romeTime.getHours()).padStart(2, '0')}:${String(romeTime.getMinutes()).padStart(2, '0')}`;
      
      expect(localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(localTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('parseLocalDate e compareDatesOnly funzionano insieme', () => {
      const date1 = parseLocalDate('2023-06-15');
      const date2 = parseLocalDate('2023-06-16');
      
      expect(compareDatesOnly(date1, date2)).toBeLessThan(0);
      expect(compareDatesOnly(date2, date1)).toBeGreaterThan(0);
    });
  });

  describe('Gestione errori e casi edge', () => {
    it('compareDatesOnly gestisce correttamente date null/undefined', () => {
      const validDate = new Date('2023-06-15T12:00:00.000Z');
      
      expect(() => compareDatesOnly(null, validDate)).toThrow();
      expect(() => compareDatesOnly(validDate, null)).toThrow();
      expect(() => compareDatesOnly(undefined, validDate)).toThrow();
      expect(() => compareDatesOnly(validDate, undefined)).toThrow();
    });
  });
}); 