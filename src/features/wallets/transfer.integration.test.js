// Funzione di trasferimento simile a quella in App.jsx
function transfer({ fromWalletId, toWalletId, amount, wallets, expenses, incomes }) {
  if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) throw new Error('Wallet non validi');
  if (typeof amount !== 'number' || amount <= 0) throw new Error('Importo non valido');
  const fromWallet = wallets.find(w => w.id === fromWalletId);
  const toWallet = wallets.find(w => w.id === toWalletId);
  if (!fromWallet || !toWallet) throw new Error('Wallet non trovati');
  const now = new Date().toISOString();
  const outgoing = { amount, category: 'Trasferimento', date: now, store: 'Trasferimento', walletId: fromWalletId, type: 'expense' };
  const incoming = { amount, category: 'Trasferimento', date: now, store: 'Trasferimento', walletId: toWalletId, type: 'income' };
  return {
    expenses: [...expenses, outgoing],
    incomes: [...incomes, incoming]
  };
}

describe('INTEGRAZIONE: Trasferimenti tra wallet', () => {
  const wallets = [
    { id: 'w1', name: 'Conto 1', balance: 100 },
    { id: 'w2', name: 'Conto 2', balance: 50 }
  ];
  let expenses, incomes;
  beforeEach(() => {
    expenses = [];
    incomes = [];
  });

  it('Trasferimento valido tra due wallet', () => {
    const result = transfer({ fromWalletId: 'w1', toWalletId: 'w2', amount: 30, wallets, expenses, incomes });
    expect(result.expenses).toHaveLength(1);
    expect(result.incomes).toHaveLength(1);
    expect(result.expenses[0].walletId).toBe('w1');
    expect(result.incomes[0].walletId).toBe('w2');
    expect(result.expenses[0].amount).toBe(30);
    expect(result.incomes[0].amount).toBe(30);
    expect(result.expenses[0].category).toBe('Trasferimento');
    expect(result.incomes[0].category).toBe('Trasferimento');
  });

  it('Non permette trasferimento su se stesso', () => {
    expect(() => transfer({ fromWalletId: 'w1', toWalletId: 'w1', amount: 10, wallets, expenses, incomes })).toThrow();
  });

  it('Non permette importo zero o negativo', () => {
    expect(() => transfer({ fromWalletId: 'w1', toWalletId: 'w2', amount: 0, wallets, expenses, incomes })).toThrow();
    expect(() => transfer({ fromWalletId: 'w1', toWalletId: 'w2', amount: -5, wallets, expenses, incomes })).toThrow();
  });

  it('Non permette wallet non esistenti', () => {
    expect(() => transfer({ fromWalletId: 'w1', toWalletId: 'w3', amount: 10, wallets, expenses, incomes })).toThrow();
    expect(() => transfer({ fromWalletId: 'w3', toWalletId: 'w2', amount: 10, wallets, expenses, incomes })).toThrow();
  });

  it('Saldi risultanti dopo trasferimento', () => {
    const result = transfer({ fromWalletId: 'w1', toWalletId: 'w2', amount: 40, wallets, expenses, incomes });
    // Simula calcolo saldo
    const saldoW1 = wallets[0].balance - result.expenses.filter(e => e.walletId === 'w1').reduce((sum, e) => sum + e.amount, 0);
    const saldoW2 = wallets[1].balance + result.incomes.filter(i => i.walletId === 'w2').reduce((sum, i) => sum + i.amount, 0);
    expect(saldoW1).toBe(60);
    expect(saldoW2).toBe(90);
  });
}); 