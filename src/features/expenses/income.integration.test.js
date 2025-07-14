import { addIncome, editIncome, deleteIncome, validateIncome } from './incomeLogic';

describe('INTEGRAZIONE: Flusso entrate', () => {
  let incomes;
  beforeEach(() => {
    incomes = [];
  });

  it('Aggiunge una entrata valida', () => {
    const nuova = { amount: 100, category: 'Stipendio', date: '2024-06-01' };
    incomes = addIncome(incomes, nuova);
    expect(incomes).toHaveLength(1);
    expect(incomes[0].amount).toBe(100);
    expect(incomes[0].category).toBe('Stipendio');
    expect(incomes[0].id).toBeDefined();
  });

  it('Non aggiunge entrata non valida', () => {
    expect(() => addIncome(incomes, { amount: 0, category: '', date: '' })).toThrow();
    expect(() => addIncome(incomes, null)).toThrow();
    expect(() => addIncome(incomes, undefined)).toThrow();
  });

  it('Modifica una entrata esistente', () => {
    const nuova = { amount: 100, category: 'Stipendio', date: '2024-06-01' };
    incomes = addIncome(incomes, nuova);
    const id = incomes[0].id;
    incomes = editIncome(incomes, id, { amount: 200, category: 'Bonus' });
    expect(incomes[0].amount).toBe(200);
    expect(incomes[0].category).toBe('Bonus');
  });

  it('Modificare id non esistente non cambia nulla', () => {
    const nuova = { amount: 100, category: 'Stipendio', date: '2024-06-01' };
    incomes = addIncome(incomes, nuova);
    const before = [...incomes];
    incomes = editIncome(incomes, 999999, { amount: 500 });
    expect(incomes).toEqual(before);
  });

  it('Elimina una entrata esistente', () => {
    const nuova = { amount: 100, category: 'Stipendio', date: '2024-06-01' };
    incomes = addIncome(incomes, nuova);
    const id = incomes[0].id;
    incomes = deleteIncome(incomes, id);
    expect(incomes).toHaveLength(0);
  });

  it('Eliminare id non esistente non cambia nulla', () => {
    const nuova = { amount: 100, category: 'Stipendio', date: '2024-06-01' };
    incomes = addIncome(incomes, nuova);
    const before = [...incomes];
    incomes = deleteIncome(incomes, 999999);
    expect(incomes).toEqual(before);
  });

  it('Non aggiunge doppioni identici (stesso id)', () => {
    const nuova = { amount: 100, category: 'Stipendio', date: '2024-06-01' };
    incomes = addIncome(incomes, nuova);
    const doppione = { ...incomes[0] };
    expect(() => addIncome(incomes, doppione)).not.toThrow();
    expect(incomes.length).toBe(1);
    incomes = addIncome(incomes, doppione);
    expect(incomes.length).toBe(2);
    expect(incomes[1].id).not.toBe(incomes[0].id);
  });

  it('validateIncome true solo per entrata valida', () => {
    expect(validateIncome({ amount: 100, category: 'Stipendio', date: '2024-06-01' })).toBe(true);
    expect(validateIncome({ amount: 0, category: 'Stipendio', date: '2024-06-01' })).toBe(false);
    expect(validateIncome({ amount: 100, category: '', date: '2024-06-01' })).toBe(false);
    expect(validateIncome({ amount: 100, category: 'Stipendio', date: '' })).toBe(false);
    expect(validateIncome(null)).toBe(false);
    expect(validateIncome(undefined)).toBe(false);
  });
}); 