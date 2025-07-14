// Funzioni di utilità per import/export/reset dati
function exportData({ expenses, incomes, categories, stores, wallets, theme }) {
  return JSON.stringify({ expenses, incomes, categories, stores, wallets, theme, exportDate: '2024-06-01T00:00:00Z', version: '1.0' });
}

function importData(json) {
  try {
    const data = JSON.parse(json);
    if (!data.expenses || !data.incomes || !data.categories || !data.stores || !data.wallets) {
      throw new Error('Formato file non valido');
    }
    return data;
  } catch (e) {
    throw new Error('Errore durante l\'importazione: ' + e.message);
  }
}

function resetData() {
  return { expenses: [], incomes: [], categories: {}, stores: [], wallets: [], theme: 'light' };
}

describe('INTEGRAZIONE: Import/Export/Reset dati', () => {
  const expenses = [ { id: 1, amount: 10 } ];
  const incomes = [ { id: 2, amount: 20 } ];
  const categories = { expense: [ { id: 1, name: 'Alimentari' } ], income: [ { id: 2, name: 'Stipendio' } ] };
  const stores = [ 'Esselunga', 'Coop' ];
  const wallets = [ { id: 'w1', name: 'Conto 1' } ];
  const theme = 'dark';

  it('Esporta dati in JSON', () => {
    const json = exportData({ expenses, incomes, categories, stores, wallets, theme });
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.expenses).toEqual(expenses);
    expect(parsed.incomes).toEqual(incomes);
    expect(parsed.categories).toEqual(categories);
    expect(parsed.stores).toEqual(stores);
    expect(parsed.wallets).toEqual(wallets);
    expect(parsed.theme).toBe('dark');
    expect(parsed.version).toBe('1.0');
  });

  it('Importa dati validi', () => {
    const json = exportData({ expenses, incomes, categories, stores, wallets, theme });
    const data = importData(json);
    expect(data.expenses).toEqual(expenses);
    expect(data.incomes).toEqual(incomes);
    expect(data.categories).toEqual(categories);
    expect(data.stores).toEqual(stores);
    expect(data.wallets).toEqual(wallets);
    expect(data.theme).toBe('dark');
  });

  it('Importa dati non validi (manca una chiave)', () => {
    const json = JSON.stringify({ expenses, incomes, categories, stores });
    expect(() => importData(json)).toThrow();
  });

  it('Importa dati non validi (JSON malformato)', () => {
    expect(() => importData('{invalid json')).toThrow();
  });

  it('Resetta tutti i dati', () => {
    const reset = resetData();
    expect(reset.expenses).toEqual([]);
    expect(reset.incomes).toEqual([]);
    expect(reset.categories).toEqual({});
    expect(reset.stores).toEqual([]);
    expect(reset.wallets).toEqual([]);
    expect(reset.theme).toBe('light');
  });
}); 