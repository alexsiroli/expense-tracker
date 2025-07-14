import { addExpense, editExpense, deleteExpense, validateExpense } from './expenseLogic';

describe('INTEGRAZIONE: Flusso spese', () => {
  let expenses;
  beforeEach(() => {
    expenses = [];
  });

  it('Aggiunge una spesa valida', () => {
    const nuova = { amount: 10, category: 'Alimentari', date: '2024-06-01' };
    expenses = addExpense(expenses, nuova);
    expect(expenses).toHaveLength(1);
    expect(expenses[0].amount).toBe(10);
    expect(expenses[0].category).toBe('Alimentari');
    expect(expenses[0].id).toBeDefined();
  });

  it('Non aggiunge spesa non valida', () => {
    expect(() => addExpense(expenses, { amount: 0, category: '', date: '' })).toThrow();
    expect(() => addExpense(expenses, null)).toThrow();
    expect(() => addExpense(expenses, undefined)).toThrow();
  });

  it('Modifica una spesa esistente', () => {
    const nuova = { amount: 10, category: 'Alimentari', date: '2024-06-01' };
    expenses = addExpense(expenses, nuova);
    const id = expenses[0].id;
    expenses = editExpense(expenses, id, { amount: 20, category: 'Shopping' });
    expect(expenses[0].amount).toBe(20);
    expect(expenses[0].category).toBe('Shopping');
  });

  it('Modificare id non esistente non cambia nulla', () => {
    const nuova = { amount: 10, category: 'Alimentari', date: '2024-06-01' };
    expenses = addExpense(expenses, nuova);
    const before = [...expenses];
    expenses = editExpense(expenses, 999999, { amount: 50 });
    expect(expenses).toEqual(before);
  });

  it('Elimina una spesa esistente', () => {
    const nuova = { amount: 10, category: 'Alimentari', date: '2024-06-01' };
    expenses = addExpense(expenses, nuova);
    const id = expenses[0].id;
    expenses = deleteExpense(expenses, id);
    expect(expenses).toHaveLength(0);
  });

  it('Eliminare id non esistente non cambia nulla', () => {
    const nuova = { amount: 10, category: 'Alimentari', date: '2024-06-01' };
    expenses = addExpense(expenses, nuova);
    const before = [...expenses];
    expenses = deleteExpense(expenses, 999999);
    expect(expenses).toEqual(before);
  });

  it('Non aggiunge doppioni identici (stesso id)', () => {
    const nuova = { amount: 10, category: 'Alimentari', date: '2024-06-01' };
    expenses = addExpense(expenses, nuova);
    const doppione = { ...expenses[0] };
    // Forziamo stesso id
    expect(() => addExpense(expenses, doppione)).not.toThrow(); // La funzione non blocca, ma crea un nuovo id
    expect(expenses.length).toBe(1);
    expenses = addExpense(expenses, doppione);
    expect(expenses.length).toBe(2);
    expect(expenses[1].id).not.toBe(expenses[0].id);
  });

  it('validateExpense true solo per spesa valida', () => {
    expect(validateExpense({ amount: 10, category: 'Alimentari', date: '2024-06-01' })).toBe(true);
    expect(validateExpense({ amount: 0, category: 'Alimentari', date: '2024-06-01' })).toBe(false);
    expect(validateExpense({ amount: 10, category: '', date: '2024-06-01' })).toBe(false);
    expect(validateExpense({ amount: 10, category: 'Alimentari', date: '' })).toBe(false);
    expect(validateExpense(null)).toBe(false);
    expect(validateExpense(undefined)).toBe(false);
  });
}); 