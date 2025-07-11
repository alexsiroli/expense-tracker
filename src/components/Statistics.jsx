import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

function Statistics({ expenses, incomes, currentMonthExpenses, currentMonthIncomes, dateRange }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  // Calcola le statistiche per il periodo selezionato
  const getStatsForPeriod = () => {
    const data = dateRange ? { expenses, incomes } : { expenses: currentMonthExpenses, incomes: currentMonthIncomes };
    
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalIncomes = data.incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    const balance = totalIncomes - totalExpenses;

    // Raggruppa per categoria
    const expenseByCategory = data.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    const incomeByCategory = data.incomes.reduce((acc, income) => {
      acc[income.category] = (acc[income.category] || 0) + parseFloat(income.amount);
      return acc;
    }, {});

    // Prepara i dati per i grafici
    const expenseChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      type: 'expense'
    }));

    const incomeChartData = Object.entries(incomeByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      type: 'income'
    }));

    // Dati per il grafico a barre mensile
    const monthlyData = getMonthlyData(data.expenses, data.incomes);

    return {
      totalExpenses,
      totalIncomes,
      balance,
      expenseChartData,
      incomeChartData,
      monthlyData
    };
  };

  const getMonthlyData = (expenses, incomes) => {
    const months = {};
    
    [...expenses, ...incomes].forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, expenses: 0, incomes: 0 };
      }
      
      if (item.amount) {
        if (expenses.includes(item)) {
          months[monthKey].expenses += parseFloat(item.amount);
        } else {
          months[monthKey].incomes += parseFloat(item.amount);
        }
      }
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  };

  const stats = getStatsForPeriod();
  const periodLabel = dateRange ? 'Periodo selezionato' : 'Mese corrente';

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Spese Totali</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">€{stats.totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Entrate Totali</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">€{stats.totalIncomes.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bilancio</h3>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{stats.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Label */}
      <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{periodLabel}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spese per Categoria */}
        <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Spese per Categoria</h3>
          {stats.expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nessuna spesa registrata
            </div>
          )}
        </div>

        {/* Entrate per Categoria */}
        <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Entrate per Categoria</h3>
          {stats.incomeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.incomeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nessuna entrata registrata
            </div>
          )}
        </div>
      </div>

      {/* Grafico a Barre Mensile */}
      <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Andamento Mensile</h3>
        {stats.monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => `€${value.toFixed(2)}`}
                labelFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year}`;
                }}
              />
              <Legend />
              <Bar dataKey="expenses" fill="#ef4444" name="Spese" />
              <Bar dataKey="incomes" fill="#22c55e" name="Entrate" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nessun dato disponibile
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics; 