import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Store, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#6366f1', '#f59e42'];

function Statistics({ expenses, incomes, currentMonthExpenses, currentMonthIncomes, categories = [], stores = [], activeFilters = {} }) {



  // I dati arrivano già filtrati dall'App.jsx
  const filteredData = useMemo(() => {
    return { expenses, incomes };
  }, [expenses, incomes]);

  // Riepilogo del mese corrente
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = filteredData.expenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const currentMonthIncomes = filteredData.incomes.filter(i => {
    const date = new Date(i.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const currentMonthTotalExpenses = currentMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const currentMonthTotalIncomes = currentMonthIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const currentMonthBalance = currentMonthTotalIncomes - currentMonthTotalExpenses;
  
  // Nome del mese corrente
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  const currentMonthName = monthNames[currentMonth];
  
  // Riepilogo totale (per compatibilità)
  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncomes = filteredData.incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const balance = totalIncomes - totalExpenses;

  // Statistiche temporali (per mese)
  const monthlyData = useMemo(() => {
    const months = {};
    [...filteredData.expenses, ...filteredData.incomes].forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) months[monthKey] = { month: monthKey, Spese: 0, Entrate: 0 };
      if (filteredData.expenses.includes(item)) months[monthKey].Spese += parseFloat(item.amount);
      else months[monthKey].Entrate += parseFloat(item.amount);
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Statistiche per categoria
  const expenseByCategory = useMemo(() => {
    const acc = {};
    filteredData.expenses.forEach(e => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    });
    return acc;
  }, [filteredData]);
  const incomeByCategory = useMemo(() => {
    const acc = {};
    filteredData.incomes.forEach(i => {
      acc[i.category] = (acc[i.category] || 0) + parseFloat(i.amount);
    });
    return acc;
  }, [filteredData]);
  const expenseCategoryChart = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const incomeCategoryChart = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));

  // Statistiche per negozio
  const expenseByStore = useMemo(() => {
    const acc = {};
    filteredData.expenses.forEach(e => {
      const store = e.store || 'Senza negozio';
      acc[store] = (acc[store] || 0) + parseFloat(e.amount);
    });
    return acc;
  }, [filteredData]);
  const incomeByStore = useMemo(() => {
    const acc = {};
    filteredData.incomes.forEach(i => {
      const store = i.store || 'Senza negozio';
      acc[store] = (acc[store] || 0) + parseFloat(i.amount);
    });
    return acc;
  }, [filteredData]);
  
  const expenseStoreChart = Object.entries(expenseByStore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
  const incomeStoreChart = Object.entries(incomeByStore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Helpers
  const getCategoryIcon = (categoryName) => {
    // Cerca prima nelle categorie spese, poi nelle entrate
    const expenseCategory = categories.expense?.find(cat => cat.name === categoryName);
    const incomeCategory = categories.income?.find(cat => cat.name === categoryName);
    const category = expenseCategory || incomeCategory;
    return category?.icon || '📦';
  };

  // Custom tooltip per istogrammi
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // UI
  return (
    <div className="space-y-6">
      {/* Riepilogo del mese corrente */}
      <div className="card p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><DollarSign className="w-6 h-6 text-blue-600" /></div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{currentMonthName}</h3>
            <p className={`text-3xl font-bold ${currentMonthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(currentMonthBalance)}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-red-600">Spese: {formatCurrency(currentMonthTotalExpenses)}</span>
              <span className="text-green-600">Entrate: {formatCurrency(currentMonthTotalIncomes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grafico temporale con riepilogo */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Andamento temporale
          </h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Spese: {formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Entrate: {formatCurrency(totalIncomes)}</span>
            </div>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={v => { const [y, m] = v.split('-'); return `${m}/${y.slice(2)}`; }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="Spese" stroke="#ef4444" name="Spese" strokeWidth={3} />
              <Line type="monotone" dataKey="Entrate" stroke="#22c55e" name="Entrate" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="text-center py-12 text-gray-500 dark:text-gray-400">Nessun dato disponibile</div>}
      </div>

      {/* Grafici per categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spese per Categoria */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Tag className="w-5 h-5" /> Spese per Categoria</h3>
          {expenseCategoryChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseCategoryChart} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} fill="#8884d8" dataKey="value">
                  {expenseCategoryChart.map((entry, idx) => (
                    <Cell key={`cell-exp-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna spesa registrata</div>}
        </div>
        {/* Entrate per Categoria */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-green-600" /> Entrate per Categoria</h3>
          {incomeCategoryChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={incomeCategoryChart} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} fill="#22c55e" dataKey="value">
                  {incomeCategoryChart.map((entry, idx) => (
                    <Cell key={`cell-inc-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna entrata registrata</div>}
        </div>
      </div>

      {/* Grafici per negozio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spese per Negozio */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Store className="w-5 h-5" /> Spese per Negozio</h3>
          {expenseStoreChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseStoreChart} layout="vertical">
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1">
                  {expenseStoreChart.map((entry, idx) => (
                    <Cell key={`cell-store-exp-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna spesa registrata</div>}
        </div>
        {/* Entrate per Negozio */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-green-600" /> Entrate per Negozio</h3>
          {incomeStoreChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeStoreChart} layout="vertical">
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#22c55e">
                  {incomeStoreChart.map((entry, idx) => (
                    <Cell key={`cell-store-inc-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna entrata registrata</div>}
        </div>
      </div>

      {/* Tabelle dettagliate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tabella categorie spese */}
        <div className="card p-6 overflow-x-auto">
          <h4 className="font-semibold mb-2 flex items-center gap-2"><Tag className="w-4 h-4" /> Dettaglio Spese per Categoria</h4>
          <table className="min-w-full text-sm">
            <thead><tr><th className="text-left">Categoria</th><th className="text-right">Totale</th></tr></thead>
            <tbody>
              {expenseCategoryChart.map(cat => (
                <tr key={cat.name}>
                  <td className="flex items-center gap-2 py-1">{getCategoryIcon(cat.name)} {cat.name}</td>
                  <td className="text-right">{formatCurrency(cat.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Tabella negozi spese */}
        <div className="card p-6 overflow-x-auto">
          <h4 className="font-semibold mb-2 flex items-center gap-2"><Store className="w-4 h-4" /> Dettaglio Spese per Negozio</h4>
          <table className="min-w-full text-sm">
            <thead><tr><th className="text-left">Negozio</th><th className="text-right">Totale</th></tr></thead>
            <tbody>
              {expenseStoreChart.map(store => (
                <tr key={store.name}>
                  <td className="py-1">{store.name}</td>
                  <td className="text-right">{formatCurrency(store.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 