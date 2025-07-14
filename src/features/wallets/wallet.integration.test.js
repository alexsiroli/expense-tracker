import { addWallet, editWallet, deleteWallet, validateWallet, calculateWalletBalance } from './walletLogic';

describe('INTEGRAZIONE: Gestione wallet', () => {
  let wallets;
  beforeEach(() => {
    wallets = [
      { id: 'w1', name: 'Conto 1', color: '#6366f1', balance: 100, initialBalance: 100 },
      { id: 'w2', name: 'Conto 2', color: '#f59e42', balance: 50, initialBalance: 50 }
    ];
  });

  it('Aggiunge un wallet valido', () => {
    const nuovo = { name: 'Conto 3', color: '#10b981', balance: 0 };
    const result = addWallet(wallets, nuovo);
    expect(result).toHaveLength(3);
    expect(result[2].name).toBe('Conto 3');
    expect(result[2].id).toBeDefined();
  });

  it('Non aggiunge duplicati (nome già esistente)', () => {
    const nuovo = { name: 'Conto 1', color: '#6366f1', balance: 0 };
    expect(() => addWallet(wallets, nuovo)).toThrow();
  });

  it('Non aggiunge wallet non valido', () => {
    expect(() => addWallet(wallets, { name: '', color: '' })).toThrow();
    expect(() => addWallet(wallets, null)).toThrow();
    expect(() => addWallet(wallets, undefined)).toThrow();
  });

  it('Modifica un wallet esistente', () => {
    const result = editWallet(wallets, 'w1', { name: 'Conto Modificato', color: '#ef4444' });
    expect(result[0].name).toBe('Conto Modificato');
    expect(result[0].color).toBe('#ef4444');
  });

  it('Modificare id non esistente non cambia nulla', () => {
    const before = [...wallets];
    const result = editWallet(wallets, 'w999', { name: 'Altro' });
    expect(result).toEqual(before);
  });

  it('Elimina un wallet esistente', () => {
    const result = deleteWallet(wallets, 'w1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('w2');
  });

  it('Eliminare id non esistente non cambia nulla', () => {
    const before = [...wallets];
    const result = deleteWallet(wallets, 'w999');
    expect(result).toEqual(before);
  });

  it('validateWallet true solo per wallet valido', () => {
    expect(validateWallet({ name: 'Conto', color: '#fff' })).toBe(true);
    expect(validateWallet({ name: '', color: '#fff' })).toBe(false);
    expect(validateWallet({ name: 'Conto', color: '' })).toBe(false);
    expect(validateWallet(null)).toBe(false);
    expect(validateWallet(undefined)).toBe(false);
  });

  it('calculateWalletBalance calcola saldo corretto', () => {
    const wallet = { id: 'w1', initialBalance: 100 };
    const expenses = [ { walletId: 'w1', amount: 30 }, { walletId: 'w2', amount: 10 } ];
    const incomes = [ { walletId: 'w1', amount: 20 }, { walletId: 'w2', amount: 5 } ];
    const saldo = calculateWalletBalance(wallet, expenses, incomes);
    expect(saldo).toBe(90); // 100 + 20 - 30
  });
}); 