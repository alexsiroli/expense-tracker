import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Store, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { HeatMapGrid } from 'react-grid-heatmap';
import { add, format, startOfWeek, endOfWeek, isSameWeek, parseISO, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { getTotal, getByCategory, getByStore, getMonthlyData, getMonthlyBalance, getDailyAvgHeatmap } from '../features/statistics/statisticsLogic';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#6366f1', '#f59e42'];

function Statistics({ expenses, incomes, categories = [], stores = [], activeFilters = {} }) {



  // I dati arrivano già filtrati dall'App.jsx
  const filteredData = useMemo(() => {
    return { expenses, incomes };
  }, [expenses, incomes]);

  
  
  // Riepilogo totale
  const { totalExpenses, totalIncomes, balance } = useMemo(() => getTotal(filteredData.expenses, filteredData.incomes), [filteredData]);

  // Statistiche temporali (per mese)
  const monthlyData = useMemo(() => getMonthlyData(filteredData.expenses, filteredData.incomes), [filteredData]);

  // Statistiche per categoria
  const expenseByCategory = useMemo(() => getByCategory(filteredData.expenses), [filteredData]);
  const incomeByCategory = useMemo(() => getByCategory(filteredData.incomes), [filteredData]);
  const expenseCategoryChart = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const incomeCategoryChart = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));

  // Statistiche per negozio
  const expenseByStore = useMemo(() => getByStore(filteredData.expenses), [filteredData]);
  const incomeByStore = useMemo(() => getByStore(filteredData.incomes), [filteredData]);
  
  const expenseStoreChart = Object.entries(expenseByStore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
  const incomeStoreChart = Object.entries(incomeByStore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // --- Andamento temporale settimanale ---
  const weeklyData = useMemo(() => {
    // Raggruppa per settimana ISO
    const weeks = {};
    filteredData.expenses.concat(filteredData.incomes)
      .filter(item => item.category !== 'Trasferimento')
      .forEach(item => {
        if (!item.date) return;
        const date = new Date(item.date);
        // Trova il lunedì della settimana
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'yyyy-ww');
        if (!weeks[weekKey]) weeks[weekKey] = { week: weekKey, Spese: 0, Entrate: 0, weekStart };
        if (filteredData.expenses.includes(item)) weeks[weekKey].Spese += parseFloat(item.amount);
        else weeks[weekKey].Entrate += parseFloat(item.amount);
      });
    return Object.values(weeks).sort((a, b) => a.weekStart - b.weekStart);
  }, [filteredData]);

  // --- Heatmap bilancio ultimi 6 mesi ---
  const last6Months = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      arr.push(format(d, 'yyyy-MM'));
    }
    return arr;
  }, []);
  const monthlyBalance = useMemo(() => getMonthlyBalance(filteredData.expenses, filteredData.incomes, last6Months), [filteredData, last6Months]);

  // --- Heatmap giornaliera media ---
  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const dailyAvgHeatmap = useMemo(() => getDailyAvgHeatmap(filteredData.expenses), [filteredData]);

  // --- Tooltip universale leggibile ---
  const ThemedTooltip = ({ active, payload, label, labelPrefix, valueFormatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          {label && <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{labelPrefix}{label}</p>}
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

  // Stato per toggle vista temporale
  const [trendView, setTrendView] = useState('week'); // 'week' o 'month'

  // UI
  return (
    <div className="space-y-6">
      {/* Bilancio del periodo filtrato */}
      <div className="card p-6">
                  <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bilancio</h3>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="text-red-600">Spese: {formatCurrency(totalExpenses)}</span>
              <span className="text-green-600">Entrate: {formatCurrency(totalIncomes)}</span>
            </div>
          </div>
      </div>

      {/* Andamento temporale settimanale/mensile con toggle */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Andamento {trendView === 'week' ? 'settimanale' : 'mensile'}
          </h3>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${trendView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setTrendView('week')}
            >Settimane</button>
            <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${trendView === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setTrendView('month')}
            >Mesi</button>
          </div>
        </div>
        {(trendView === 'week' ? weeklyData : monthlyData).length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendView === 'week' ? weeklyData : monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={trendView === 'week' ? 'week' : 'month'} tickFormatter={v => {
                if (trendView === 'week') {
                  const [y, w] = v.split('-');
                  return `W${w}/${y.slice(2)}`;
                } else {
                  const [y, m] = v.split('-');
                  return `${m}/${y.slice(2)}`;
                }
              }} />
              <YAxis />
              <Tooltip content={<ThemedTooltip labelPrefix={trendView === 'week' ? 'Settimana: ' : 'Mese: '} valueFormatter={formatCurrency} />} />
              <Legend />
              <Line type="monotone" dataKey="Spese" stroke="#ef4444" name="Spese" strokeWidth={3} dot />
              <Line type="monotone" dataKey="Entrate" stroke="#22c55e" name="Entrate" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="text-center py-12 text-gray-500 dark:text-gray-400">Nessun dato disponibile</div>}
      </div>
      {/* Heatmap bilancio ultimi 6 mesi (più alta, titolo corto) */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Bilancio 6 mesi</h3>
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-md">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlyBalance}>
                <XAxis dataKey="mese" tickFormatter={v => {
                  const [y, m] = v.split('-');
                  return `${m}/${y.slice(2)}`;
                }} />
                <YAxis hide />
                <Tooltip content={<ThemedTooltip labelPrefix="Mese: " valueFormatter={formatCurrency} />} />
                <Bar dataKey="bilancio" name="Bilancio" >
                  {monthlyBalance.map((entry, idx) => (
                    <Cell key={entry.mese} fill={entry.bilancio >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Heatmap Giornaliera media (più alta, titolo corto) */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Media spese settimanale</h3>
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-md">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weekDays.map((d, i) => ({ day: d, media: dailyAvgHeatmap[i] }))}>
                <XAxis dataKey="day" />
                <YAxis hide />
                <Tooltip content={<ThemedTooltip labelPrefix="Giorno: " valueFormatter={formatCurrency} />} />
                <Bar dataKey="media" fill="#f59e42" name="Media spese" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 mt-2">Giorno con più spese medie: <b>{weekDays[dailyAvgHeatmap.indexOf(Math.max(...dailyAvgHeatmap))]}</b></div>
        </div>
      </div>

      {/* Grafici per categoria */}
      <div className="space-y-8">
        {/* Spese per Categoria */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Tag className="w-5 h-5" /> Spese per Categoria</h3>
          {expenseCategoryChart.length > 0 ? (
            <>
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
              {/* Tabella dettagliata sotto il grafico */}
              <div className="overflow-x-auto mt-4">
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
            </>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna spesa registrata</div>}
        </div>
        {/* Entrate per Categoria */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-green-600" /> Entrate per Categoria</h3>
          {incomeCategoryChart.length > 0 ? (
            <>
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
              {/* Tabella dettagliata sotto il grafico */}
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm">
                  <thead><tr><th className="text-left">Categoria</th><th className="text-right">Totale</th></tr></thead>
                  <tbody>
                    {incomeCategoryChart.map(cat => (
                      <tr key={cat.name}>
                        <td className="flex items-center gap-2 py-1">{getCategoryIcon(cat.name)} {cat.name}</td>
                        <td className="text-right">{formatCurrency(cat.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna entrata registrata</div>}
        </div>
      </div>

      {/* Grafici per negozio */}
      <div className="space-y-8">
        {/* Entrate per Negozio */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-green-600" /> Entrate per Negozio</h3>
          {incomeStoreChart.length > 0 ? (
            <>
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
              {/* Tabella dettagliata sotto il grafico */}
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm">
                  <thead><tr><th className="text-left">Negozio</th><th className="text-right">Totale</th></tr></thead>
                  <tbody>
                    {incomeStoreChart.map(store => (
                      <tr key={store.name}>
                        <td className="py-1">{store.name}</td>
                        <td className="text-right">{formatCurrency(store.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna entrata registrata</div>}
        </div>
        {/* Spese per Negozio */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Store className="w-5 h-5" /> Spese per Negozio</h3>
          {expenseStoreChart.length > 0 ? (
            <>
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
              {/* Tabella dettagliata sotto il grafico */}
              <div className="overflow-x-auto mt-4">
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
            </>
          ) : <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nessuna spesa registrata</div>}
        </div>
      </div>


    </div>
  );
}

export default Statistics; 