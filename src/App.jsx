import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Statistics from './components/Statistics';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  // Carica i dati dal localStorage all'avvio
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedIncomes = localStorage.getItem('incomes');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedIncomes) {
      setIncomes(JSON.parse(savedIncomes));
    }
  }, []);

  // Salva i dati nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  const addExpense = (expense) => {
    setExpenses([...expenses, { ...expense, id: Date.now(), date: new Date().toISOString() }]);
    setShowForm(false);
  };

  const addIncome = (income) => {
    setIncomes([...incomes, { ...income, id: Date.now(), date: new Date().toISOString() }]);
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const deleteIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalIncomes = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const balance = totalIncomes - totalExpenses;

  const currentMonth = format(new Date(), 'yyyy-MM', { locale: it });
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );
  const currentMonthIncomes = incomes.filter(income => 
    income.date.startsWith(currentMonth)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Tracker Spese
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Balance Card */}
        <div className="card p-6 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Bilancio Totale</h2>
            <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{balance.toFixed(2)}
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div className="text-green-600">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Entrate: €{totalIncomes.toFixed(2)}
                </div>
              </div>
              <div className="text-red-600">
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  Spese: €{totalExpenses.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-lg shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-l-lg transition-colors ${
              activeTab === 'expenses'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Spese
            </div>
          </button>
          <button
            onClick={() => setActiveTab('incomes')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'incomes'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Entrate
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-r-lg transition-colors ${
              activeTab === 'stats'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiche
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Le tue spese</h2>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi
              </button>
            </div>
            <ExpenseList
              items={expenses}
              onDelete={deleteExpense}
              type="expense"
            />
          </div>
        )}

        {activeTab === 'incomes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Le tue entrate</h2>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi
              </button>
            </div>
            <ExpenseList
              items={incomes}
              onDelete={deleteIncome}
              type="income"
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <Statistics
            expenses={expenses}
            incomes={incomes}
            currentMonthExpenses={currentMonthExpenses}
            currentMonthIncomes={currentMonthIncomes}
          />
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <ExpenseForm
          onSubmit={activeTab === 'expenses' ? addExpense : addIncome}
          onClose={() => setShowForm(false)}
          type={activeTab === 'expenses' ? 'expense' : 'income'}
        />
      )}
    </div>
  );
}

export default App;
