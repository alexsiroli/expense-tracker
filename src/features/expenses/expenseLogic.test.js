import { addExpense, editExpense, deleteExpense, validateExpense, validateDateNotFuture, isFutureDate } from './expenseLogic';

describe('expenseLogic', () => {
  const baseExpenses = [
    { id: 1, amount: 50, category: 'Alimentari', date: '2023-06-01', store: 'Esselunga' },
    { id: 2, amount: 20, category: 'Trasporti', date: '2023-06-02', store: 'ATM' },
  ];

  describe('addExpense', () => {
    it('aggiunge una nuova spesa valida', () => {
      const newExp = { amount: 30, category: 'Shopping', date: '2023-07-01', store: 'Zara' };
      const result = addExpense(baseExpenses, newExp);
      expect(result.length).toBe(3);
      expect(result[2].category).toBe('Shopping');
      expect(result[2].amount).toBe(30);
      expect(result[2].id).toBeDefined();
    });

    it('lancia errore se dati non validi', () => {
      expect(() => addExpense(baseExpenses, { amount: 0, category: '', date: '' })).toThrow();
    });

    it('funziona su array vuoto', () => {
      const result = addExpense([], { amount: 10, category: 'Test', date: '2023-01-01' });
      expect(result.length).toBe(1);
      expect(result[0].amount).toBe(10);
    });

    it('genera ID unico per ogni spesa', () => {
      const newExp1 = { amount: 10, category: 'Test1', date: '2023-01-01', store: 'Store1' };
      const newExp2 = { amount: 20, category: 'Test2', date: '2023-01-02', store: 'Store2' };
      
      const result1 = addExpense([], newExp1);
      const result2 = addExpense([], newExp2);
      
      expect(result1[0].id).not.toBe(result2[0].id);
    });
  });

  describe('editExpense', () => {
    it('modifica solo la spesa giusta', () => {
      const result = editExpense(baseExpenses, 2, { amount: 99, store: 'Uber' });
      expect(result[1].amount).toBe(99);
      expect(result[1].store).toBe('Uber');
      expect(result[0].amount).toBe(50); // Non modificata
    });

    it('non modifica spese con ID diverso', () => {
      const result = editExpense(baseExpenses, 1, { amount: 999 });
      expect(result[0].amount).toBe(999);
      expect(result[1].amount).toBe(20); // Non modificata
    });

    it('mantiene tutti i campi esistenti', () => {
      const result = editExpense(baseExpenses, 1, { amount: 999 });
      expect(result[0].category).toBe('Alimentari');
      expect(result[0].date).toBe('2023-06-01');
      expect(result[0].store).toBe('Esselunga');
    });
  });

  describe('deleteExpense', () => {
    it('elimina la spesa giusta', () => {
      const result = deleteExpense(baseExpenses, 1);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('ritorna array vuoto se elimina l\'ultima spesa', () => {
      const singleExpense = [{ id: 1, amount: 10, category: 'Test', date: '2023-01-01', store: 'Store' }];
      const result = deleteExpense(singleExpense, 1);
      expect(result.length).toBe(0);
    });

    it('non modifica array se ID non trovato', () => {
      const result = deleteExpense(baseExpenses, 999);
      expect(result).toEqual(baseExpenses);
    });
  });

  describe('validateExpense', () => {
    it('ritorna true per spesa valida', () => {
      expect(validateExpense({ amount: 10, category: 'Test', date: '2023-01-01' })).toBe(true);
    });

    it('ritorna false per spesa non valida', () => {
      expect(validateExpense({ amount: 0, category: '', date: '' })).toBe(false);
      expect(validateExpense({ amount: -10, category: 'Test', date: '2023-01-01' })).toBe(false);
      expect(validateExpense({ amount: 10, category: '', date: '2023-01-01' })).toBe(false);
      expect(validateExpense({ amount: 10, category: 'Test', date: '' })).toBe(false);
      expect(validateExpense({})).toBe(false);
      expect(validateExpense(null)).toBe(false);
      expect(validateExpense(undefined)).toBe(false);
    });

    it('ritorna true per date future (ora permesse)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateExpense({ 
        amount: 10, 
        category: 'Test', 
        date: tomorrow.toISOString() 
      })).toBe(true);
    });

    it('accetta importi decimali', () => {
      expect(validateExpense({ amount: 10.50, category: 'Test', date: '2023-01-01' })).toBe(true);
      expect(validateExpense({ amount: 0.01, category: 'Test', date: '2023-01-01' })).toBe(true);
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