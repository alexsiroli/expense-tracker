import { addCategory, editCategory, deleteCategory, validateCategory } from './categoryLogic';

describe('INTEGRAZIONE: Gestione categorie', () => {
  let categories;
  beforeEach(() => {
    categories = [
      { id: 1, name: 'Alimentari', icon: '🍽️' },
      { id: 2, name: 'Shopping', icon: '🛍️' }
    ];
  });

  it('Aggiunge una categoria valida', () => {
    const nuova = { name: 'Viaggi', icon: '✈️' };
    const result = addCategory(categories, nuova);
    expect(result).toHaveLength(3);
    expect(result[2].name).toBe('Viaggi');
    expect(result[2].id).toBeDefined();
  });

  it('Non aggiunge duplicati (nome già esistente)', () => {
    const nuova = { name: 'Alimentari', icon: '🍽️' };
    expect(() => addCategory(categories, nuova)).toThrow();
  });

  it('Non aggiunge categoria non valida', () => {
    expect(() => addCategory(categories, { name: '', icon: '' })).toThrow();
    expect(() => addCategory(categories, null)).toThrow();
    expect(() => addCategory(categories, undefined)).toThrow();
  });

  it('Modifica una categoria esistente', () => {
    const result = editCategory(categories, 1, { name: 'Cibo', icon: '🍔' });
    expect(result[0].name).toBe('Cibo');
    expect(result[0].icon).toBe('🍔');
  });

  it('Modificare id non esistente non cambia nulla', () => {
    const before = [...categories];
    const result = editCategory(categories, 999, { name: 'Altro' });
    expect(result).toEqual(before);
  });

  it('Elimina una categoria esistente', () => {
    const result = deleteCategory(categories, 1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('Eliminare id non esistente non cambia nulla', () => {
    const before = [...categories];
    const result = deleteCategory(categories, 999);
    expect(result).toEqual(before);
  });

  it('validateCategory true solo per categoria valida', () => {
    expect(validateCategory({ name: 'Cibo', icon: '🍔' })).toBe(true);
    expect(validateCategory({ name: '', icon: '🍔' })).toBe(false);
    expect(validateCategory({ name: 'Cibo', icon: '' })).toBe(false);
    expect(validateCategory(null)).toBe(false);
    expect(validateCategory(undefined)).toBe(false);
  });
}); 