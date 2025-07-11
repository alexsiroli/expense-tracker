import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings, Wallet, PiggyBank, Sun, Moon, Tag, Database } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Statistics from './components/Statistics';
import CategoryManager from './components/CategoryManager';
import ConfirmDialog from './components/ConfirmDialog';
import DateRangePicker from './components/DateRangePicker';
import { useTheme } from './hooks/useTheme';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import WalletManager from './components/WalletManager';
import DataManager from './components/DataManager';

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

// Palette colori per portafogli
const WALLET_COLORS = [
  '#6366f1', // indigo
  '#f59e42', // orange
  '#10b981', // green
  '#ef4444', // red
  '#3b82f6', // blue
  '#f43f5e', // pink
  '#eab308', // yellow
  '#a21caf', // purple
  '#0ea5e9', // sky
  '#f97316', // amber
];

// Modello dati conto: { id, name, color, balance, initialBalance }
const defaultWallet = {
  id: 'wallet-1',
  name: 'Conto Principale',
  color: WALLET_COLORS[0],
  balance: 0,
  initialBalance: 0,
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
  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem('wallets');
    if (saved) return JSON.parse(saved);
    return [defaultWallet];
  });
  const [activeWalletId, setActiveWalletId] = useState(() => wallets[0]?.id || defaultWallet.id);
  const [balanceCollapsed, setBalanceCollapsed] = useState(false);

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

  // Aggiorna localStorage quando cambiano i conti
  useEffect(() => {
    localStorage.setItem('wallets', JSON.stringify(wallets));
  }, [wallets]);



  // Mostra tutte le transazioni (non più filtrate per conto)
  const filteredExpenses = expenses;
  const filteredIncomes = incomes;

  // Calcola il saldo di un conto dinamicamente
  const calculateWalletBalance = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return 0;
    
    const totalIn = incomes.filter(i => i.walletId === walletId).reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const totalOut = expenses.filter(e => e.walletId === walletId).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    // Usa il saldo iniziale se disponibile, altrimenti il saldo corrente
    const baseBalance = wallet.initialBalance !== undefined ? wallet.initialBalance : wallet.balance;
    return baseBalance + totalIn - totalOut;
  };

  // Calcola i saldi di tutti i conti dinamicamente
  const getWalletsWithCalculatedBalance = () => {
    return wallets.map(wallet => ({
      ...wallet,
      balance: calculateWalletBalance(wallet.id) // Sostituisce il saldo con quello calcolato
    }));
  };

  // Aggiungi spesa/entrata associata a conto
  const addExpense = (expense) => {
    const newExpense = { 
      ...expense, 
      id: Date.now(), 
      date: expense.date ? new Date(expense.date + 'T00:00:00').toISOString() : new Date().toISOString() 
    };
    setExpenses([...expenses, newExpense]);
    setShowForm(false);
    setEditingItem(null);
  };
  const addIncome = (income) => {
    const newIncome = { 
      ...income, 
      id: Date.now(), 
      date: income.date ? new Date(income.date + 'T00:00:00').toISOString() : new Date().toISOString() 
    };
    setIncomes([...incomes, newIncome]);
    setShowForm(false);
    setEditingItem(null);
  };
  // Modifica transazione
  const updateItem = (updatedItem) => {
    const updatedWithDate = {
      ...updatedItem,
      date: updatedItem.date ? new Date(updatedItem.date + 'T00:00:00').toISOString() : new Date().toISOString()
    };
    if (activeTab === 'expenses') {
      setExpenses(expenses.map(expense => expense.id === updatedWithDate.id ? updatedWithDate : expense));
    } else {
      setIncomes(incomes.map(income => income.id === updatedWithDate.id ? updatedWithDate : income));
    }
    setShowForm(false);
    setEditingItem(null);
  };
  // Elimina transazione
  const handleDelete = (id) => {
    if (itemToDelete && itemToDelete.type === 'wallet') {
      // Elimina conto
      performWalletDeletion(id);
    } else {
      // Elimina transazione
      if (activeTab === 'expenses') {
        setExpenses(expenses.filter(expense => expense.id !== id));
      } else {
        setIncomes(incomes.filter(income => income.id !== id));
      }
    }
    setShowConfirmDelete(false);
    setItemToDelete(null);
  };
  // Elimina conto e tutte le transazioni collegate
  const deleteWallet = (id) => {
    const wallet = wallets.find(w => w.id === id);
    const walletExpenses = expenses.filter(e => e.walletId === id);
    const walletIncomes = incomes.filter(i => i.walletId === id);
    
    if (walletExpenses.length > 0 || walletIncomes.length > 0) {
      setItemToDelete({ type: 'wallet', id, wallet, expenses: walletExpenses, incomes: walletIncomes });
      setShowConfirmDelete(true);
    } else {
      // Se non ci sono transazioni, elimina direttamente
      performWalletDeletion(id);
    }
  };

  const performWalletDeletion = (id) => {
    setWallets(wallets.filter(w => w.id !== id));
    setExpenses(expenses.filter(e => e.walletId !== id));
    setIncomes(incomes.filter(i => i.walletId !== id));
    if (activeWalletId === id) {
      setActiveWalletId(wallets[0]?.id || 'wallet-1');
    }
    updateAllWalletsBalance();
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
    if (!dateRange) return { expenses: expenses, incomes: incomes };
    
    const dateFilteredExpenses = expenses.filter(expense => {
      const expenseDate = expense.date.split('T')[0];
      return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    });
    
    const dateFilteredIncomes = incomes.filter(income => {
      const incomeDate = income.date.split('T')[0];
      return incomeDate >= dateRange.startDate && incomeDate <= dateRange.endDate;
    });
    
    return { expenses: dateFilteredExpenses, incomes: dateFilteredIncomes };
  };

  const filteredData = getFilteredData();

  // Funzioni gestione conti
  const addWallet = (wallet) => {
    const newWallet = {
      ...wallet,
      id: `wallet-${Date.now()}`,
      initialBalance: parseFloat(wallet.balance) || 0, // Salva il saldo iniziale
      balance: parseFloat(wallet.balance) || 0, // Per compatibilità
    };
    setWallets([...wallets, newWallet]);
  };
  const editWallet = (updatedWallet) => {
    setWallets(wallets.map(w => {
      if (w.id === updatedWallet.id) {
        return {
          ...w,
          ...updatedWallet,
          initialBalance: parseFloat(updatedWallet.balance) || 0, // Aggiorna il saldo iniziale
        };
      }
      return w;
    }));
  };

  // Funzione per importare i dati
  const importData = (data) => {
    // Importa tutti i dati
    if (data.expenses) {
      setExpenses(data.expenses);
      localStorage.setItem('expenses', JSON.stringify(data.expenses));
    }
    if (data.incomes) {
      setIncomes(data.incomes);
      localStorage.setItem('incomes', JSON.stringify(data.incomes));
    }
    if (data.categories) {
      setCategories(data.categories);
      localStorage.setItem('categories', JSON.stringify(data.categories));
    }
    if (data.stores) {
      setStores(data.stores);
      localStorage.setItem('stores', JSON.stringify(data.stores));
    }
    if (data.wallets) {
      setWallets(data.wallets);
      localStorage.setItem('wallets', JSON.stringify(data.wallets));
      // Imposta il primo conto come attivo
      if (data.wallets.length > 0) {
        setActiveWalletId(data.wallets[0].id);
      }
    }
    if (data.theme) {
      localStorage.setItem('theme', data.theme);
    }
  };
  // deleteWallet = (id) => { // This function is now handled by the new updateAllWalletsBalance
  //   setWallets(wallets.filter(w => w.id !== id));
  //   // TODO: elimina anche tutte le transazioni collegate a questo portafoglio
  //   if (activeWalletId === id) {
  //     setActiveWalletId(wallets[0]?.id || 'wallet-1');
  //   }
  // };

  return (
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 pt-28 pb-24">
      {/* Header con gradiente */}
      <header className="fixed top-0 left-0 w-full z-30 py-6">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-blue-600/40 backdrop-blur-md border border-blue-700/60 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Wallet className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold text-white">
                  MoneyTracker
                </h1>
              </div>
              <button
                onClick={toggleTheme}
                className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Balance Card con design moderno - PRIMA COSA */}
      <div className="max-w-md mx-auto px-6 pt-4 pb-6">
        <div className={`floating-card ${balanceCollapsed ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiggyBank className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bilancio Totale</h2>
              {balanceCollapsed && (
                <span className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{balance.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={() => setBalanceCollapsed(!balanceCollapsed)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {balanceCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          
          {!balanceCollapsed && (
            <>
              <div className="text-center mt-4">
                <div className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

              {/* Sezione gestione conti */}
              <div className="mt-8">
                <WalletManager
                  wallets={getWalletsWithCalculatedBalance()}
                  onAdd={addWallet}
                  onEdit={editWallet}
                  onDelete={deleteWallet}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 -mt-6 relative z-10">

        {/* Content */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Le tue spese</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Aggiungi Spesa</span>
              </button>
            </div>
            <ExpenseList
              items={filteredExpenses}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Le tue entrate</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Aggiungi Entrata</span>
              </button>
            </div>
            <ExpenseList
              items={filteredIncomes}
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
            <div className="mt-8">
              <Statistics
                expenses={filteredData.expenses}
                incomes={filteredData.incomes}
                currentMonthExpenses={currentMonthExpenses}
                currentMonthIncomes={currentMonthIncomes}
                dateRange={dateRange}
              />
            </div>
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

        {activeTab === 'data' && (
          <div>
            <DataManager onImportData={importData} />
          </div>
        )}
      </div>

      {/* Navigation Tabs fluttuante in basso */}
      <div className="fixed bottom-0 left-0 w-full z-30 py-3">
        <div className="max-w-md mx-auto px-6">
          <div className="glass-card p-2">
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'expenses'
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Spese</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('incomes')}
                className={`py-4 px-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'incomes'
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrate</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'stats'
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Stats</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'categories'
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span className="hidden sm:inline">Cat.</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`py-4 px-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'data'
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Dati</span>
                </div>
              </button>
            </div>
          </div>
        </div>
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
          wallets={wallets}
          selectedWalletId={activeWalletId}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => handleDelete(itemToDelete?.id || itemToDelete)}
        title={itemToDelete?.type === 'wallet' ? "Conferma eliminazione conto" : "Conferma eliminazione"}
        message={
          itemToDelete?.type === 'wallet' 
            ? `Sei sicuro di voler eliminare il conto "${itemToDelete?.wallet?.name}"? Questa azione eliminerà anche ${itemToDelete?.expenses?.length || 0} spese e ${itemToDelete?.incomes?.length || 0} entrate collegate. Questa azione non può essere annullata.`
            : "Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata."
        }
      />
    </div>
  );
}

export default App;
