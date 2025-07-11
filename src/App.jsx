import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings, Wallet, PiggyBank } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header con gradiente */}
      <header className="gradient-bg text-white shadow-2xl">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">MoneyTracker</h1>
          </div>
          <p className="text-center text-blue-100 text-sm">Gestisci le tue finanze in modo intelligente</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-8 -mt-6 relative z-10">
        {/* Balance Card con design moderno */}
        <div className="floating-card p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <PiggyBank className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Bilancio Totale</h2>
            </div>
            <div className={`text-4xl font-bold mb-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{balance.toFixed(2)}
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-green-600">
                <div className="flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  Entrate
                </div>
                <div className="text-lg font-bold">€{totalIncomes.toFixed(2)}</div>
              </div>
              <div className="text-red-600">
                <div className="flex items-center gap-1 font-semibold">
                  <TrendingDown className="w-4 h-4" />
                  Spese
                </div>
                <div className="text-lg font-bold">€{totalExpenses.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs con design moderno */}
        <div className="glass-card p-2 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'expenses'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Spese
              </div>
            </button>
            <button
              onClick={() => setActiveTab('incomes')}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 ${
                activeTab === 'incomes'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Entrate
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Stats
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Le tue spese</h2>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-danger"
              >
                <Plus className="w-5 h-5 mr-2" />
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Le tue entrate</h2>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-success"
              >
                <Plus className="w-5 h-5 mr-2" />
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
