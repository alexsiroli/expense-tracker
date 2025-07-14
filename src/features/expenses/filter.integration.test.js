// Funzione di filtro simile a getFilteredData in App.jsx
function filterTransactions({ expenses, incomes, filters, dateRange }) {
  let filteredExpenses = expenses;
  let filteredIncomes = incomes;

  // Filtro per categorie
  if (filters.selectedCategories && filters.selectedCategories.length > 0) {
    filteredExpenses = filteredExpenses.filter(e => filters.selectedCategories.includes(e.category));
    filteredIncomes = filteredIncomes.filter(i => filters.selectedCategories.includes(i.category));
  }

  // Filtro per wallet
  if (filters.selectedWallets && filters.selectedWallets.length > 0) {
    filteredExpenses = filteredExpenses.filter(e => filters.selectedWallets.includes(e.walletId));
    filteredIncomes = filteredIncomes.filter(i => filters.selectedWallets.includes(i.walletId));
  }

  // Filtro per store
  if (filters.selectedStores && filters.selectedStores.length > 0) {
    filteredExpenses = filteredExpenses.filter(e => filters.selectedStores.includes(e.store));
    filteredIncomes = filteredIncomes.filter(i => filters.selectedStores.includes(i.store));
  }

  // Filtro per date range
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    filteredExpenses = filteredExpenses.filter(e => {
      const d = e.date.split('T')[0];
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
    filteredIncomes = filteredIncomes.filter(i => {
      const d = i.date.split('T')[0];
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
  }

  return { expenses: filteredExpenses, incomes: filteredIncomes };
}

describe('INTEGRAZIONE: Filtri su spese e entrate', () => {
  const expenses = [
    { id: '1', amount: 10, category: 'Alimentari', date: '2024-06-01', walletId: 'w1', store: 'Esselunga' },
    { id: '2', amount: 20, category: 'Shopping', date: '2024-06-02', walletId: 'w2', store: 'Zara' },
    { id: '3', amount: 30, category: 'Alimentari', date: '2024-06-03', walletId: 'w1', store: 'Coop' },
  ];
  const incomes = [
    { id: '4', amount: 100, category: 'Stipendio', date: '2024-06-01', walletId: 'w1', store: 'Azienda' },
    { id: '5', amount: 50, category: 'Regali', date: '2024-06-02', walletId: 'w2', store: 'Amico' },
  ];

  it('Filtra per categoria', () => {
    const filters = { selectedCategories: ['Alimentari'], selectedWallets: [], selectedStores: [] };
    const { expenses: e, incomes: i } = filterTransactions({ expenses, incomes, filters });
    expect(e).toHaveLength(2);
    expect(i).toHaveLength(0);
  });

  it('Filtra per wallet', () => {
    const filters = { selectedCategories: [], selectedWallets: ['w2'], selectedStores: [] };
    const { expenses: e, incomes: i } = filterTransactions({ expenses, incomes, filters });
    expect(e).toHaveLength(1);
    expect(e[0].id).toBe('2');
    expect(i).toHaveLength(1);
    expect(i[0].id).toBe('5');
  });

  it('Filtra per store', () => {
    const filters = { selectedCategories: [], selectedWallets: [], selectedStores: ['Esselunga'] };
    const { expenses: e, incomes: i } = filterTransactions({ expenses, incomes, filters });
    expect(e).toHaveLength(1);
    expect(e[0].store).toBe('Esselunga');
    expect(i).toHaveLength(0);
  });

  it('Filtra per data range', () => {
    const filters = { selectedCategories: [], selectedWallets: [], selectedStores: [] };
    const dateRange = { startDate: '2024-06-02', endDate: '2024-06-03' };
    const { expenses: e, incomes: i } = filterTransactions({ expenses, incomes, filters, dateRange });
    expect(e).toHaveLength(2);
    expect(i).toHaveLength(1);
  });

  it('Filtra per combinazione di filtri', () => {
    const filters = { selectedCategories: ['Alimentari'], selectedWallets: ['w1'], selectedStores: ['Coop'] };
    const { expenses: e, incomes: i } = filterTransactions({ expenses, incomes, filters });
    expect(e).toHaveLength(1);
    expect(e[0].id).toBe('3');
    expect(i).toHaveLength(0);
  });

  it('Edge case: nessun risultato', () => {
    const filters = { selectedCategories: ['NonEsiste'], selectedWallets: [], selectedStores: [] };
    const { expenses: e, incomes: i } = filterTransactions({ expenses, incomes, filters });
    expect(e).toHaveLength(0);
    expect(i).toHaveLength(0);
  });

  it('Edge case: dati vuoti', () => {
    const filters = { selectedCategories: [], selectedWallets: [], selectedStores: [] };
    const { expenses: e, incomes: i } = filterTransactions({ expenses: [], incomes: [], filters });
    expect(e).toHaveLength(0);
    expect(i).toHaveLength(0);
  });
}); 