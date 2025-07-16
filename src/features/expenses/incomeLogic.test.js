import { addIncome, editIncome, deleteIncome, validateIncome, validateDateNotFuture } from './incomeLogic';

describe('incomeLogic', () => {
  const baseIncomes = [
    { id: 1, amount: 100, category: 'Stipendio', date: '2023-06-05', source: 'Azienda' },
    { id: 2, amount: 40, category: 'Regali', date: '2023-07-10', source: 'Amico' },
  ];

  it('addIncome aggiunge una nuova entrata valida', () => {
    const newInc = { amount: 60, category: 'Freelance', date: '2023-08-01', source: 'Cliente' };
    const result = addIncome(baseIncomes, newInc);
    expect(result.length).toBe(3);
    expect(result[2].category).toBe('Freelance');
    expect(result[2].amount).toBe(60);
    expect(result[2].id).toBeDefined();
  });

  it('addIncome lancia errore se dati non validi', () => {
    expect(() => addIncome(baseIncomes, { amount: 0, category: '', date: '' })).toThrow();
  });

  it('editIncome modifica solo l\'entrata giusta', () => {
    const result = editIncome(baseIncomes, 2, { amount: 99, source: 'Parente' });
    expect(result[1].amount).toBe(99);
    expect(result[1].source).toBe('Parente');
    expect(result[0].amount).toBe(100);
  });

  it('deleteIncome elimina l\'entrata giusta', () => {
    const result = deleteIncome(baseIncomes, 1);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  it('validateIncome ritorna true per entrata valida', () => {
    expect(validateIncome({ amount: 10, category: 'Test', date: '2023-01-01' })).toBe(true);
  });

  it('validateIncome ritorna false per entrata non valida', () => {
    expect(validateIncome({ amount: 0, category: '', date: '' })).toBe(false);
    expect(validateIncome({})).toBe(false);
    expect(validateIncome(null)).toBe(false);
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

  it('validateIncome ritorna false per date future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validateIncome({ 
      amount: 10, 
      category: 'Test', 
      date: tomorrow.toISOString() 
    })).toBe(false);
  });

  it('addIncome su array vuoto', () => {
    const result = addIncome([], { amount: 10, category: 'Test', date: '2023-01-01' });
    expect(result.length).toBe(1);
    expect(result[0].amount).toBe(10);
  });

  it('editIncome con id non trovato non modifica nulla', () => {
    const result = editIncome(baseIncomes, 999, { amount: 99 });
    expect(result).toEqual(baseIncomes);
  });

  it('deleteIncome con id non trovato non elimina nulla', () => {
    const result = deleteIncome(baseIncomes, 999);
    expect(result).toEqual(baseIncomes);
  });

  it('addIncome lancia errore se newIncome è null/undefined', () => {
    expect(() => addIncome(baseIncomes, null)).toThrow();
    expect(() => addIncome(baseIncomes, undefined)).toThrow();
  });

  it('validateIncome ritorna false per tipi errati', () => {
    expect(validateIncome(123)).toBe(false);
    expect(validateIncome('test')).toBe(false);
    expect(validateIncome([])).toBe(false);
  });

  it('editIncome senza campi non modifica nulla', () => {
    const result = editIncome(baseIncomes, 1, {});
    expect(result[0]).toEqual(baseIncomes[0]);
  });
}); 