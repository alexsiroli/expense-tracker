import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

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
    <div className="space-y-8">
      {/* Statistiche generali */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Entrate Totali</h3>
              <p className="text-sm text-slate-500">Questo mese: €{currentMonthTotalIncomes.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">€{totalIncomes.toFixed(2)}</p>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Spese Totali</h3>
              <p className="text-sm text-slate-500">Questo mese: €{currentMonthTotalExpenses.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Bilancio */}
      <div className="stat-card">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Bilancio</h3>
          </div>
          <div className={`text-4xl font-bold mb-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{balance.toFixed(2)}
          </div>
          <p className="text-sm text-slate-500">
            Questo mese: €{currentMonthBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Grafico spese per categoria */}
      {expenseChartData.length > 0 && (
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-xl">
              <PieChartIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Spese per Categoria</h3>
          </div>
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
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <PieChartIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Entrate per Categoria</h3>
          </div>
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
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Andamento Mensile</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  formatter={(value) => `€${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="incomes" fill="#10B981" name="Entrate" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" name="Spese" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Nessun dato */}
      {expenses.length === 0 && incomes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Nessun dato disponibile</h3>
          <p className="text-slate-400 text-sm">
            Aggiungi spese e entrate per vedere le statistiche
          </p>
        </div>
      )}
    </div>
  );
}

export default Statistics; 