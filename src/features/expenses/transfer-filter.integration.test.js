// Test di integrazione per il filtro dei trasferimenti
function filterTransactionsWithTransfers({ expenses, incomes, filters }) {
  let filteredExpenses = expenses;
  let filteredIncomes = incomes;

  // Filtro per trasferimenti
  if (!filters.showTransfers) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.category !== 'Trasferimento'
    );
    filteredIncomes = filteredIncomes.filter(income => 
      income.category !== 'Trasferimento'
    );
  }

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

  return { expenses: filteredExpenses, incomes: filteredIncomes };
}

describe('INTEGRAZIONE: Filtro trasferimenti', () => {
  const expenses = [
    { id: '1', amount: 10, category: 'Alimentari', date: '2024-06-01', walletId: 'w1', store: 'Esselunga' },
    { id: '2', amount: 20, category: 'Trasferimento', date: '2024-06-02', walletId: 'w1', store: 'Trasferimento' },
    { id: '3', amount: 30, category: 'Shopping', date: '2024-06-03', walletId: 'w2', store: 'Zara' },
  ];
  const incomes = [
    { id: '4', amount: 100, category: 'Stipendio', date: '2024-06-01', walletId: 'w1', store: 'Azienda' },
    { id: '5', amount: 20, category: 'Trasferimento', date: '2024-06-02', walletId: 'w2', store: 'Trasferimento' },
    { id: '6', amount: 50, category: 'Regali', date: '2024-06-02', walletId: 'w2', store: 'Amico' },
  ];

  it('Nasconde i trasferimenti quando showTransfers è false', () => {
    const filters = { 
      showTransfers: false, 
      selectedCategories: [], 
      selectedWallets: [] 
    };
    const { expenses: e, incomes: i } = filterTransactionsWithTransfers({ expenses, incomes, filters });
    
    expect(e).toHaveLength(2);
    expect(e.find(exp => exp.category === 'Trasferimento')).toBeUndefined();
    expect(i).toHaveLength(2);
    expect(i.find(inc => inc.category === 'Trasferimento')).toBeUndefined();
  });

  it('Mostra i trasferimenti quando showTransfers è true', () => {
    const filters = { 
      showTransfers: true, 
      selectedCategories: [], 
      selectedWallets: [] 
    };
    const { expenses: e, incomes: i } = filterTransactionsWithTransfers({ expenses, incomes, filters });
    
    expect(e).toHaveLength(3);
    expect(e.find(exp => exp.category === 'Trasferimento')).toBeDefined();
    expect(i).toHaveLength(3);
    expect(i.find(inc => inc.category === 'Trasferimento')).toBeDefined();
  });

  it('Combina filtro trasferimenti con filtro categorie', () => {
    const filters = { 
      showTransfers: false, 
      selectedCategories: ['Alimentari'], 
      selectedWallets: [] 
    };
    const { expenses: e, incomes: i } = filterTransactionsWithTransfers({ expenses, incomes, filters });
    
    expect(e).toHaveLength(1);
    expect(e[0].category).toBe('Alimentari');
    expect(i).toHaveLength(0);
  });

  it('Combina filtro trasferimenti con filtro wallet', () => {
    const filters = { 
      showTransfers: false, 
      selectedCategories: [], 
      selectedWallets: ['w1'] 
    };
    const { expenses: e, incomes: i } = filterTransactionsWithTransfers({ expenses, incomes, filters });
    
    expect(e).toHaveLength(1);
    expect(e[0].walletId).toBe('w1');
    expect(e[0].category).not.toBe('Trasferimento');
    expect(i).toHaveLength(1);
    expect(i[0].walletId).toBe('w1');
    expect(i[0].category).not.toBe('Trasferimento');
  });
}); 