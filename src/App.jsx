import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings, Wallet, PiggyBank, Sun, Moon, Tag } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Statistics from './components/Statistics';
import CategoryManager from './components/CategoryManager';
import ConfirmDialog from './components/ConfirmDialog';
import DateRangePicker from './components/DateRangePicker';
import { useTheme } from './hooks/useTheme';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Categorie predefinite
const defaultCategories = {
  expense: [
    { id: 1, name: 'Alimentari', icon: '🍽️' },
    { id: 2, name: 'Trasporti', icon: '🚗' },
    { id: 3, name: 'Intrattenimento', icon: '🎮' },
    { id: 4, name: 'Shopping', icon: '🛍️' },
    { id: 5, name: 'Bollette', icon: '💡' },
    { id: 6, name: 'Salute', icon: '🏥' },
    { id: 7, name: 'Educazione', icon: '📚' },
    { id: 8, name: 'Altro', icon: '📦' }
  ],
  income: [
    { id: 9, name: 'Stipendio', icon: '💼' },
    { id: 10, name: 'Freelance', icon: '💻' },
    { id: 11, name: 'Investimenti', icon: '📈' },
    { id: 12, name: 'Regali', icon: '🎁' },
    { id: 13, name: 'Vendite', icon: '🛒' },
    { id: 14, name: 'Altro', icon: '📦' }
  ]
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [stores, setStores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [headerCompact, setHeaderCompact] = useState(false);

  // Carica i dati dal localStorage all'avvio
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedIncomes = localStorage.getItem('incomes');
    const savedCategories = localStorage.getItem('categories');
    const savedStores = localStorage.getItem('stores');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedIncomes) {
      setIncomes(JSON.parse(savedIncomes));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedStores) {
      setStores(JSON.parse(savedStores));
    }
  }, []);

  // Salva i dati nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('stores', JSON.stringify(stores));
  }, [stores]);

  // Gestione scroll per header compatto
  useEffect(() => {
    const handleScroll = () => {
      setHeaderCompact(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addExpense = (expense) => {
    const newExpense = { ...expense, id: Date.now(), date: new Date().toISOString() };
    setExpenses([...expenses, newExpense]);
    
    // Aggiungi il negozio se nuovo
    if (expense.store && !stores.includes(expense.store)) {
      setStores([...stores, expense.store]);
    }
    
    setShowForm(false);
    setEditingItem(null);
  };

  const addIncome = (income) => {
    const newIncome = { ...income, id: Date.now(), date: new Date().toISOString() };
    setIncomes([...incomes, newIncome]);
    
    // Aggiungi il negozio se nuovo
    if (income.store && !stores.includes(income.store)) {
      setStores([...stores, income.store]);
    }
    
    setShowForm(false);
    setEditingItem(null);
  };

  const updateItem = (updatedItem) => {
    if (activeTab === 'expenses') {
      setExpenses(expenses.map(expense => 
        expense.id === updatedItem.id ? updatedItem : expense
      ));
    } else {
      setIncomes(incomes.map(income => 
        income.id === updatedItem.id ? updatedItem : income
      ));
    }
    
    // Aggiungi il negozio se nuovo
    if (updatedItem.store && !stores.includes(updatedItem.store)) {
      setStores([...stores, updatedItem.store]);
    }
    
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (activeTab === 'expenses') {
      setExpenses(expenses.filter(expense => expense.id !== id));
    } else {
      setIncomes(incomes.filter(income => income.id !== id));
    }
    setShowConfirmDelete(false);
    setItemToDelete(null);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const addCategory = (name, icon, type) => {
    const newCategory = {
      id: Date.now(),
      name,
      icon
    };
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], newCategory]
    }));
  };

  const deleteCategory = (id) => {
    setCategories(prev => ({
      expense: prev.expense.filter(cat => cat.id !== id),
      income: prev.income.filter(cat => cat.id !== id)
    }));
  };

  const editCategory = (id, name, icon) => {
    setCategories(prev => ({
      expense: prev.expense.map(cat => cat.id === id ? { ...cat, name, icon } : cat),
      income: prev.income.map(cat => cat.id === id ? { ...cat, name, icon } : cat)
    }));
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

  // Filtra i dati per il range di date selezionato
  const getFilteredData = () => {
    if (!dateRange) return { expenses, incomes };
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = expense.date.split('T')[0];
      return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    });
    
    const filteredIncomes = incomes.filter(income => {
      const incomeDate = income.date.split('T')[0];
      return incomeDate >= dateRange.startDate && incomeDate <= dateRange.endDate;
    });
    
    return { expenses: filteredExpenses, incomes: filteredIncomes };
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header con gradiente */}
      <header className={`gradient-bg text-white shadow-2xl transition-all duration-300 ${headerCompact ? 'header-compact' : 'header-full'}`}>
        <div className="max-w-md mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="w-6 h-6" />
              </div>
              <h1 className={`font-bold transition-all duration-300 ${headerCompact ? 'text-xl' : 'text-3xl'}`}>
                MoneyTracker
              </h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          {!headerCompact && (
            <p className="text-center text-blue-100 text-sm mt-2">
              Gestisci le tue finanze in modo intelligente
            </p>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-8 -mt-6 relative z-10">
        {/* Balance Card con design moderno */}
        <div className="floating-card p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <PiggyBank className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Bilancio Totale</h2>
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
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-shrink-0 py-4 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'expenses'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Spese
              </div>
            </button>
            <button
              onClick={() => setActiveTab('incomes')}
              className={`flex-shrink-0 py-4 px-4 text-sm font-semibold transition-all duration-300 ${
                activeTab === 'incomes'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Entrate
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-shrink-0 py-4 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Stats
              </div>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-shrink-0 py-4 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'categories'
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Tag className="w-4 h-4" />
                Categorie
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Le tue spese</h2>
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
              onDelete={confirmDelete}
              onEdit={handleEdit}
              type="expense"
              categories={categories.expense}
            />
          </div>
        )}

        {activeTab === 'incomes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Le tue entrate</h2>
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
              onDelete={confirmDelete}
              onEdit={handleEdit}
              type="income"
              categories={categories.income}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <DateRangePicker onDateRangeChange={setDateRange} />
            <Statistics
              expenses={filteredData.expenses}
              incomes={filteredData.incomes}
              currentMonthExpenses={currentMonthExpenses}
              currentMonthIncomes={currentMonthIncomes}
              dateRange={dateRange}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <CategoryManager
              categories={categories.expense}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
              onEditCategory={editCategory}
              type="expense"
            />
            <CategoryManager
              categories={categories.income}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
              onEditCategory={editCategory}
              type="income"
            />
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <ExpenseForm
          onSubmit={editingItem ? updateItem : (activeTab === 'expenses' ? addExpense : addIncome)}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          type={activeTab === 'expenses' ? 'expense' : 'income'}
          editingItem={editingItem}
          stores={stores}
          categories={activeTab === 'expenses' ? categories.expense : categories.income}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => handleDelete(itemToDelete)}
        title="Conferma eliminazione"
        message="Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata."
      />
    </div>
  );
}

export default App;
