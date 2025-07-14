import { addCategory, editCategory, deleteCategory, validateCategory } from './categoryLogic';

describe('categoryLogic', () => {
  const baseCategories = [
    { id: 1, name: 'Alimentari', icon: '🍽️' },
    { id: 2, name: 'Trasporti', icon: '🚗' },
  ];

  it('addCategory aggiunge una nuova categoria valida', () => {
    const newCat = { name: 'Shopping', icon: '🛍️' };
    const result = addCategory(baseCategories, newCat);
    expect(result.length).toBe(3);
    expect(result[2].name).toBe('Shopping');
    expect(result[2].icon).toBe('🛍️');
    expect(result[2].id).toBeDefined();
  });

  it('addCategory lancia errore se nome già esistente', () => {
    expect(() => addCategory(baseCategories, { name: 'Alimentari', icon: '🍽️' })).toThrow();
  });

  it('addCategory lancia errore se dati mancanti', () => {
    expect(() => addCategory(baseCategories, { name: '', icon: '' })).toThrow();
  });

  it('editCategory modifica solo la categoria giusta', () => {
    const result = editCategory(baseCategories, 2, { name: 'Auto', icon: '🚙' });
    expect(result[1].name).toBe('Auto');
    expect(result[1].icon).toBe('🚙');
    expect(result[0].name).toBe('Alimentari');
  });

  it('deleteCategory elimina la categoria giusta', () => {
    const result = deleteCategory(baseCategories, 1);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  it('validateCategory ritorna true per categoria valida', () => {
    expect(validateCategory({ name: 'Test', icon: '🎉' })).toBe(true);
  });

  it('validateCategory ritorna false per categoria non valida', () => {
    expect(validateCategory({ name: '', icon: '' })).toBe(false);
    expect(validateCategory({})).toBe(false);
    expect(validateCategory(null)).toBe(false);
  });

  it('addCategory su array vuoto', () => {
    const result = addCategory([], { name: 'Nuova', icon: '🆕' });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Nuova');
  });

  it('editCategory con id non trovato non modifica nulla', () => {
    const result = editCategory(baseCategories, 999, { name: 'NonEsiste' });
    expect(result).toEqual(baseCategories);
  });

  it('deleteCategory con id non trovato non elimina nulla', () => {
    const result = deleteCategory(baseCategories, 999);
    expect(result).toEqual(baseCategories);
  });

  it('addCategory lancia errore se newCategory è null/undefined', () => {
    expect(() => addCategory(baseCategories, null)).toThrow();
    expect(() => addCategory(baseCategories, undefined)).toThrow();
  });

  it('addCategory non distingue case nel nome', () => {
    expect(() => addCategory(baseCategories, { name: 'alimentari', icon: '🍽️' })).not.toThrow();
    // Se vuoi che sia case-insensitive, cambia la logica in categoryLogic.js
  });

  it('validateCategory ritorna false per tipi errati', () => {
    expect(validateCategory(123)).toBe(false);
    expect(validateCategory('test')).toBe(false);
    expect(validateCategory([])).toBe(false);
  });
}); 