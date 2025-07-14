import { getTotal, getByCategory, getMonthlyData, getByStore, getMonthlyBalance, getDailyAvgHeatmap } from './statisticsLogic';

describe('statisticsLogic', () => {
  const expenses = [
    { id: 1, amount: 50, category: 'Alimentari', date: '2023-06-01', store: 'Esselunga' },
    { id: 2, amount: 20, category: 'Trasporti', date: '2023-06-02', store: 'ATM' },
    { id: 3, amount: 30, category: 'Alimentari', date: '2023-07-01', store: 'Carrefour' },
    { id: 4, amount: 10, category: 'Trasferimento', date: '2023-07-02', store: '' },
  ];
  const incomes = [
    { id: 1, amount: 100, category: 'Stipendio', date: '2023-06-05', store: '' },
    { id: 2, amount: 40, category: 'Regali', date: '2023-07-10', store: '' },
    { id: 3, amount: 10, category: 'Trasferimento', date: '2023-07-11', store: '' },
  ];

  it('getTotal calcola totali e bilancio', () => {
    const { totalExpenses, totalIncomes, balance } = getTotal(expenses, incomes);
    expect(totalExpenses).toBe(100); // 50+20+30
    expect(totalIncomes).toBe(140); // 100+40
    expect(balance).toBe(40);
  });

  it('getByCategory calcola totali per categoria', () => {
    const res = getByCategory(expenses);
    expect(res['Alimentari']).toBe(80);
    expect(res['Trasporti']).toBe(20);
    expect(res['Trasferimento']).toBeUndefined();
  });

  it('getMonthlyData calcola totali per mese', () => {
    const res = getMonthlyData(expenses, incomes);
    expect(res).toEqual([
      { month: '2023-06', Spese: 70, Entrate: 100 },
      { month: '2023-07', Spese: 30, Entrate: 40 },
    ]);
  });

  it('getByStore calcola totali per negozio', () => {
    const res = getByStore(expenses);
    expect(res['Esselunga']).toBe(50);
    expect(res['ATM']).toBe(20);
    expect(res['Carrefour']).toBe(30);
    expect(res['Senza negozio']).toBeUndefined();
  });

  it('getMonthlyBalance calcola il bilancio mensile', () => {
    const monthsArr = ['2023-06', '2023-07'];
    const res = getMonthlyBalance(expenses, incomes, monthsArr);
    expect(res).toEqual([
      { mese: '2023-06', bilancio: 100 - 70 },
      { mese: '2023-07', bilancio: 40 - 30 },
    ]);
  });

  it('getDailyAvgHeatmap calcola la media giornaliera', () => {
    // 2023-06-01: Thu (3), 2023-06-02: Fri (4), 2023-07-01: Sat (5)
    const res = getDailyAvgHeatmap(expenses);
    expect(res[3]).toBe(50); // Giovedì
    expect(res[4]).toBe(20); // Venerdì
    expect(res[5]).toBe(30); // Sabato
    // Gli altri giorni sono 0
    expect(res[0]).toBe(0); // Lunedì
  });

  it('getTotal con array vuoti', () => {
    const res = getTotal([], []);
    expect(res.totalExpenses).toBe(0);
    expect(res.totalIncomes).toBe(0);
    expect(res.balance).toBe(0);
  });

  it('getByCategory con array vuoto', () => {
    expect(getByCategory([])).toEqual({});
  });

  it('getByCategory con dati null/undefined', () => {
    expect(getByCategory([null, undefined])).toEqual({});
  });

  it('getByStore con store non presenti', () => {
    const res = getByStore([{ amount: 10, category: 'Test', date: '2023-01-01' }]);
    expect(res['Senza negozio']).toBe(10);
  });

  it('getMonthlyData con mesi non presenti', () => {
    const res = getMonthlyData([], []);
    expect(res).toEqual([]);
  });

  it('getMonthlyBalance con mesi non presenti', () => {
    const res = getMonthlyBalance([], [], ['2022-01']);
    expect(res).toEqual([{ mese: '2022-01', bilancio: 0 }]);
  });

  it('getMonthlyData con importi stringa', () => {
    const exp = [{ amount: '10', category: 'A', date: '2023-01-01' }];
    const inc = [{ amount: '5', category: 'B', date: '2023-01-01' }];
    const res = getMonthlyData(exp, inc);
    expect(res[0].Spese).toBe(10);
    expect(res[0].Entrate).toBe(5);
  });

  it('getDailyAvgHeatmap con giorni mancanti', () => {
    const res = getDailyAvgHeatmap([]);
    expect(res.length).toBe(7);
    expect(res.every(x => x === 0)).toBe(true);
  });
}); 