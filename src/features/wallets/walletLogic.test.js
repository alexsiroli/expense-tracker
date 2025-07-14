import { addWallet, editWallet, deleteWallet, validateWallet, calculateWalletBalance } from './walletLogic';

describe('walletLogic', () => {
  const baseWallets = [
    { id: 1, name: 'Conto Principale', color: '#6366f1', balance: 100, initialBalance: 100 },
    { id: 2, name: 'Risparmi', color: '#10b981', balance: 200, initialBalance: 200 },
  ];
  const expenses = [
    { id: 1, walletId: 1, amount: 50 },
    { id: 2, walletId: 2, amount: 20 },
  ];
  const incomes = [
    { id: 1, walletId: 1, amount: 30 },
    { id: 2, walletId: 2, amount: 10 },
  ];

  it('addWallet aggiunge un nuovo wallet valido', () => {
    const newWallet = { name: 'Carta', color: '#ef4444' };
    const result = addWallet(baseWallets, newWallet);
    expect(result.length).toBe(3);
    expect(result[2].name).toBe('Carta');
    expect(result[2].color).toBe('#ef4444');
    expect(result[2].id).toBeDefined();
  });

  it('addWallet lancia errore se nome già esistente', () => {
    expect(() => addWallet(baseWallets, { name: 'Risparmi', color: '#10b981' })).toThrow();
  });

  it('addWallet lancia errore se dati mancanti', () => {
    expect(() => addWallet(baseWallets, { name: '', color: '' })).toThrow();
  });

  it('editWallet modifica solo il wallet giusto', () => {
    const result = editWallet(baseWallets, 2, { name: 'Salvadanaio', color: '#eab308' });
    expect(result[1].name).toBe('Salvadanaio');
    expect(result[1].color).toBe('#eab308');
    expect(result[0].name).toBe('Conto Principale');
  });

  it('deleteWallet elimina il wallet giusto', () => {
    const result = deleteWallet(baseWallets, 1);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  it('validateWallet ritorna true per wallet valido', () => {
    expect(validateWallet({ name: 'Test', color: '#fff' })).toBe(true);
  });

  it('validateWallet ritorna false per wallet non valido', () => {
    expect(validateWallet({ name: '', color: '' })).toBe(false);
    expect(validateWallet({})).toBe(false);
    expect(validateWallet(null)).toBe(false);
  });

  it('calculateWalletBalance calcola il saldo corretto', () => {
    const saldo1 = calculateWalletBalance(baseWallets[0], expenses, incomes);
    // saldo iniziale 100 + 30 (income) - 50 (expense) = 80
    expect(saldo1).toBe(80);
    const saldo2 = calculateWalletBalance(baseWallets[1], expenses, incomes);
    // saldo iniziale 200 + 10 - 20 = 190
    expect(saldo2).toBe(190);
  });

  it('calculateWalletBalance ritorna 0 se wallet non esiste', () => {
    expect(calculateWalletBalance(null, expenses, incomes)).toBe(0);
  });

  it('addWallet su array vuoto', () => {
    const result = addWallet([], { name: 'Nuovo', color: '#fff' });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Nuovo');
  });

  it('editWallet con id non trovato non modifica nulla', () => {
    const result = editWallet(baseWallets, 999, { name: 'NonEsiste' });
    expect(result).toEqual(baseWallets);
  });

  it('deleteWallet con id non trovato non elimina nulla', () => {
    const result = deleteWallet(baseWallets, 999);
    expect(result).toEqual(baseWallets);
  });

  it('addWallet lancia errore se newWallet è null/undefined', () => {
    expect(() => addWallet(baseWallets, null)).toThrow();
    expect(() => addWallet(baseWallets, undefined)).toThrow();
  });

  it('addWallet non distingue case nel nome', () => {
    expect(() => addWallet(baseWallets, { name: 'conto principale', color: '#fff' })).not.toThrow();
    // Se vuoi che sia case-insensitive, cambia la logica in walletLogic.js
  });

  it('validateWallet ritorna false per tipi errati', () => {
    expect(validateWallet(123)).toBe(false);
    expect(validateWallet('test')).toBe(false);
    expect(validateWallet([])).toBe(false);
  });

  it('calculateWalletBalance con array vuoti', () => {
    expect(calculateWalletBalance(baseWallets[0], [], [])).toBe(baseWallets[0].initialBalance);
  });
}); 