import { addExpense, editExpense, deleteExpense, validateExpense, validateDateNotFuture } from './expenseLogic';

describe('expenseLogic', () => {
  const baseExpenses = [
    { id: 1, amount: 50, category: 'Alimentari', date: '2023-06-01', store: 'Esselunga' },
    { id: 2, amount: 20, category: 'Trasporti', date: '2023-06-02', store: 'ATM' },
  ];

  it('addExpense aggiunge una nuova spesa valida', () => {
    const newExp = { amount: 30, category: 'Shopping', date: '2023-07-01', store: 'Zara' };
    const result = addExpense(baseExpenses, newExp);
    expect(result.length).toBe(3);
    expect(result[2].category).toBe('Shopping');
    expect(result[2].amount).toBe(30);
    expect(result[2].id).toBeDefined();
  });

  it('addExpense lancia errore se dati non validi', () => {
    expect(() => addExpense(baseExpenses, { amount: 0, category: '', date: '' })).toThrow();
  });

  it('editExpense modifica solo la spesa giusta', () => {
    const result = editExpense(baseExpenses, 2, { amount: 99, store: 'Uber' });
    expect(result[1].amount).toBe(99);
    expect(result[1].store).toBe('Uber');
    expect(result[0].amount).toBe(50);
  });

  it('deleteExpense elimina la spesa giusta', () => {
    const result = deleteExpense(baseExpenses, 1);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  it('validateExpense ritorna true per spesa valida', () => {
    expect(validateExpense({ amount: 10, category: 'Test', date: '2023-01-01' })).toBe(true);
  });

  it('validateExpense ritorna false per spesa non valida', () => {
    expect(validateExpense({ amount: 0, category: '', date: '' })).toBe(false);
    expect(validateExpense({})).toBe(false);
    expect(validateExpense(null)).toBe(false);
  });

  it('validateDateNotFuture ritorna true per date passate', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(validateDateNotFuture(yesterday.toISOString())).toBe(true);
  });

  it('validateDateNotFuture ritorna true per data di oggi', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validateDateNotFuture(today)).toBe(true);
  });

  it('validateDateNotFuture ritorna false per date future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validateDateNotFuture(tomorrow.toISOString())).toBe(false);
  });

  it('validateDateNotFuture ritorna false per date non valide', () => {
    expect(validateDateNotFuture(null)).toBe(false);
    expect(validateDateNotFuture(undefined)).toBe(false);
    expect(validateDateNotFuture('')).toBe(false);
  });

  it('validateExpense ritorna false per date future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validateExpense({ 
      amount: 10, 
      category: 'Test', 
      date: tomorrow.toISOString() 
    })).toBe(false);
  });

  it('addExpense su array vuoto', () => {
    const result = addExpense([], { amount: 10, category: 'Test', date: '2023-01-01' });
    expect(result.length).toBe(1);
    expect(result[0].amount).toBe(10);
  });

  it('editExpense con id non trovato non modifica nulla', () => {
    const result = editExpense(baseExpenses, 999, { amount: 99 });
    expect(result).toEqual(baseExpenses);
  });

  it('deleteExpense con id non trovato non elimina nulla', () => {
    const result = deleteExpense(baseExpenses, 999);
    expect(result).toEqual(baseExpenses);
  });

  it('addExpense lancia errore se newExpense è null/undefined', () => {
    expect(() => addExpense(baseExpenses, null)).toThrow();
    expect(() => addExpense(baseExpenses, undefined)).toThrow();
  });

  it('validateExpense ritorna false per tipi errati', () => {
    expect(validateExpense(123)).toBe(false);
    expect(validateExpense('test')).toBe(false);
    expect(validateExpense([])).toBe(false);
  });

  it('editExpense senza campi non modifica nulla', () => {
    const result = editExpense(baseExpenses, 1, {});
    expect(result[0]).toEqual(baseExpenses[0]);
  });
}); 