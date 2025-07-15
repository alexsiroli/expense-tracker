// Totale spese e entrate
export function getTotal(expenses, incomes) {
  const totalExpenses = expenses.filter(e => e.category !== 'Trasferimento').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncomes = incomes.filter(i => i.category !== 'Trasferimento').reduce((sum, i) => sum + parseFloat(i.amount), 0);
  return { totalExpenses, totalIncomes, balance: totalIncomes - totalExpenses };
}

// Statistiche per categoria
export function getByCategory(items) {
  return items.filter(e => e && typeof e === 'object' && e.category !== 'Trasferimento' && e.category !== undefined)
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
}

// Statistiche per mese (ritorna array ordinato)
export function getMonthlyData(expenses, incomes) {
  const months = {};
  [...expenses.filter(e => e.category !== 'Trasferimento'), ...incomes.filter(i => i.category !== 'Trasferimento')].forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[monthKey]) months[monthKey] = { month: monthKey, Spese: 0, Entrate: 0 };
    if (expenses.includes(item)) months[monthKey].Spese += parseFloat(item.amount);
    else months[monthKey].Entrate += parseFloat(item.amount);
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
}

// Statistiche per negozio
export function getByStore(items) {
  return items.filter(e => e && typeof e === 'object' && e.category !== 'Trasferimento')
    .reduce((acc, e) => {
      const store = e.store || 'Senza negozio';
      acc[store] = (acc[store] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
}

// Bilancio mensile ultimi N mesi
export function getMonthlyBalance(expenses, incomes, monthsArr) {
  const map = {};
  expenses.filter(e => e.category !== 'Trasferimento').forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = { entrate: 0, spese: 0 };
    map[key].spese += parseFloat(e.amount);
  });
  incomes.filter(i => i.category !== 'Trasferimento').forEach(i => {
    const d = new Date(i.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = { entrate: 0, spese: 0 };
    map[key].entrate += parseFloat(i.amount);
  });
  return monthsArr.map(m => {
    const b = map[m] || { entrate: 0, spese: 0 };
    return { mese: m, bilancio: b.entrate - b.spese };
  });
}

// Heatmap giornaliera media (array 7 giorni, Lun-Dom)
export function getDailyAvgHeatmap(expenses) {
  const days = Array(7).fill(0);
  const counts = Array(7).fill(0);
  expenses.filter(e => e.category !== 'Trasferimento').forEach(e => {
    const d = new Date(e.date);
    const day = (d.getDay() + 6) % 7;
    days[day] += parseFloat(e.amount);
    counts[day]++;
  });
  return days.map((sum, i) => counts[i] ? sum / counts[i] : 0);
} 