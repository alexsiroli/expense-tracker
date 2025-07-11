import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

function Statistics({ expenses, incomes, currentMonthExpenses, currentMonthIncomes }) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalIncomes = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const balance = totalIncomes - totalExpenses;

  const currentMonthTotalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const currentMonthTotalIncomes = currentMonthIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const currentMonthBalance = currentMonthTotalIncomes - currentMonthTotalExpenses;

  // Statistiche per categoria (spese)
  const expenseByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const expenseChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Statistiche per categoria (entrate)
  const incomeByCategory = incomes.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + parseFloat(income.amount);
    return acc;
  }, {});

  const incomeChartData = Object.entries(incomeByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Statistiche mensili (ultimi 6 mesi)
  const getMonthlyStats = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM yyyy', { locale: it });
      
      const monthExpenses = expenses.filter(expense => 
        expense.date.startsWith(monthKey)
      ).reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      const monthIncomes = incomes.filter(income => 
        income.date.startsWith(monthKey)
      ).reduce((sum, income) => sum + parseFloat(income.amount), 0);
      
      months.push({
        month: monthName,
        expenses: monthExpenses,
        incomes: monthIncomes,
        balance: monthIncomes - monthExpenses
      });
    }
    
    return months;
  };

  const monthlyData = getMonthlyStats();

  return (
    <div className="space-y-6">
      {/* Statistiche generali */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Entrate Totali</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">€{totalIncomes.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Questo mese: €{currentMonthTotalIncomes.toFixed(2)}</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Spese Totali</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Questo mese: €{currentMonthTotalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Bilancio */}
      <div className="card p-4">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Bilancio</h3>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{balance.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500">
            Questo mese: €{currentMonthBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Grafico spese per categoria */}
      {expenseChartData.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Spese per Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grafico entrate per categoria */}
      {incomeChartData.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Entrate per Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grafico mensile */}
      {monthlyData.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Andamento Mensile</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                <Bar dataKey="incomes" fill="#10B981" name="Entrate" />
                <Bar dataKey="expenses" fill="#EF4444" name="Spese" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Nessun dato */}
      {expenses.length === 0 && incomes.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Nessun dato disponibile</p>
          <p className="text-sm text-gray-400 mt-1">
            Aggiungi spese e entrate per vedere le statistiche
          </p>
        </div>
      )}
    </div>
  );
}

export default Statistics; 