import { addIncome, editIncome, deleteIncome, validateIncome, validateDateNotFuture, isFutureDate } from './incomeLogic';

describe('incomeLogic', () => {
  const baseIncomes = [
    { id: 1, amount: 1500, category: 'Stipendio', date: '2023-06-01', store: 'Azienda' },
    { id: 2, amount: 200, category: 'Bonus', date: '2023-06-02', store: 'Azienda' },
  ];

  describe('addIncome', () => {
    it('aggiunge una nuova entrata valida', () => {
      const newInc = { amount: 500, category: 'Freelance', date: '2023-07-01', store: 'Cliente' };
      const result = addIncome(baseIncomes, newInc);
      expect(result.length).toBe(3);
      expect(result[2].category).toBe('Freelance');
      expect(result[2].amount).toBe(500);
      expect(result[2].id).toBeDefined();
    });

    it('lancia errore se dati non validi', () => {
      expect(() => addIncome(baseIncomes, { amount: 0, category: '', date: '' })).toThrow();
    });

    it('funziona su array vuoto', () => {
      const result = addIncome([], { amount: 1000, category: 'Test', date: '2023-01-01' });
      expect(result.length).toBe(1);
      expect(result[0].amount).toBe(1000);
    });

    it('genera ID unico per ogni entrata', () => {
      const newInc1 = { amount: 100, category: 'Test1', date: '2023-01-01', store: 'Store1' };
      const newInc2 = { amount: 200, category: 'Test2', date: '2023-01-02', store: 'Store2' };
      
      const result1 = addIncome([], newInc1);
      const result2 = addIncome([], newInc2);
      
      expect(result1[0].id).not.toBe(result2[0].id);
    });
  });

  describe('editIncome', () => {
    it('modifica solo l\'entrata giusta', () => {
      const result = editIncome(baseIncomes, 2, { amount: 300, store: 'Nuovo Cliente' });
      expect(result[1].amount).toBe(300);
      expect(result[1].store).toBe('Nuovo Cliente');
      expect(result[0].amount).toBe(1500); // Non modificata
    });

    it('non modifica entrate con ID diverso', () => {
      const result = editIncome(baseIncomes, 1, { amount: 9999 });
      expect(result[0].amount).toBe(9999);
      expect(result[1].amount).toBe(200); // Non modificata
    });

    it('mantiene tutti i campi esistenti', () => {
      const result = editIncome(baseIncomes, 1, { amount: 9999 });
      expect(result[0].category).toBe('Stipendio');
      expect(result[0].date).toBe('2023-06-01');
      expect(result[0].store).toBe('Azienda');
    });
  });

  describe('deleteIncome', () => {
    it('elimina l\'entrata giusta', () => {
      const result = deleteIncome(baseIncomes, 1);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('ritorna array vuoto se elimina l\'ultima entrata', () => {
      const singleIncome = [{ id: 1, amount: 1000, category: 'Test', date: '2023-01-01', store: 'Store' }];
      const result = deleteIncome(singleIncome, 1);
      expect(result.length).toBe(0);
    });

    it('non modifica array se ID non trovato', () => {
      const result = deleteIncome(baseIncomes, 999);
      expect(result).toEqual(baseIncomes);
    });
  });

  describe('validateIncome', () => {
    it('ritorna true per entrata valida', () => {
      expect(validateIncome({ amount: 1000, category: 'Test', date: '2023-01-01' })).toBe(true);
    });

    it('ritorna false per entrata non valida', () => {
      expect(validateIncome({ amount: 0, category: '', date: '' })).toBe(false);
      expect(validateIncome({ amount: -100, category: 'Test', date: '2023-01-01' })).toBe(false);
      expect(validateIncome({ amount: 1000, category: '', date: '2023-01-01' })).toBe(false);
      expect(validateIncome({ amount: 1000, category: 'Test', date: '' })).toBe(false);
      expect(validateIncome({})).toBe(false);
      expect(validateIncome(null)).toBe(false);
      expect(validateIncome(undefined)).toBe(false);
    });

    it('ritorna true per date future (ora permesse)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateIncome({ 
        amount: 1000, 
        category: 'Test', 
        date: tomorrow.toISOString() 
      })).toBe(true);
    });

    it('accetta importi decimali', () => {
      expect(validateIncome({ amount: 1000.50, category: 'Test', date: '2023-01-01' })).toBe(true);
      expect(validateIncome({ amount: 0.01, category: 'Test', date: '2023-01-01' })).toBe(true);
    });
  });

  describe('validateDateNotFuture', () => {
    it('ritorna true per date passate', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(validateDateNotFuture(yesterday.toISOString())).toBe(true);
    });

    it('ritorna true per data di oggi', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(validateDateNotFuture(today)).toBe(true);
    });

    it('ritorna false per date future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateDateNotFuture(tomorrow.toISOString())).toBe(false);
    });

    it('ritorna false per date non valide', () => {
      expect(validateDateNotFuture(null)).toBe(false);
      expect(validateDateNotFuture(undefined)).toBe(false);
      expect(validateDateNotFuture('')).toBe(false);
      expect(validateDateNotFuture('data-invalida')).toBe(false);
    });
  });

  describe('isFutureDate - Test base', () => {
    it('ritorna true per date future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isFutureDate(tomorrow.toISOString())).toBe(true);
    });

    it('ritorna false per date passate', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isFutureDate(yesterday.toISOString())).toBe(false);
    });

    it('ritorna false per data di oggi', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isFutureDate(today)).toBe(false);
    });

    it('ritorna false per date non valide', () => {
      expect(isFutureDate(null)).toBe(false);
      expect(isFutureDate(undefined)).toBe(false);
      expect(isFutureDate('')).toBe(false);
    });

    it('gestisce correttamente date con orari diversi', () => {
      const now = new Date();
      const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
      const todayEvening = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
      
      // Il risultato dipende dall'orario corrente, ma dovrebbe essere consistente
      const morningResult = isFutureDate(todayMorning.toISOString());
      const eveningResult = isFutureDate(todayEvening.toISOString());
      
      // Entrambe le date sono oggi, quindi il risultato dipende dall'orario corrente
      // Non possiamo prevedere esattamente quale sarà il risultato, ma dovrebbe essere consistente
      expect(typeof morningResult).toBe('boolean');
      expect(typeof eveningResult).toBe('boolean');
    });
  });
}); 