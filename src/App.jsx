import { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings, Wallet, PiggyBank, Sun, Moon, Tag, Database, Play } from 'lucide-react';
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
import { formatCurrency } from './utils/formatters';

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
    { id: 8, name: 'Trasferimento', icon: '💸' },
    { id: 9, name: 'Abbonamenti', icon: '📱' },
    { id: 10, name: 'Altro', icon: '📦' }
  ],
  income: [
    { id: 11, name: 'Stipendio', icon: '💼' },
    { id: 12, name: 'Freelance', icon: '💻' },
    { id: 13, name: 'Investimenti', icon: '📈' },
    { id: 14, name: 'Regali', icon: '🎁' },
    { id: 15, name: 'Vendite', icon: '🛒' },
    { id: 16, name: 'Bonus', icon: '🎯' },
    { id: 17, name: 'Trasferimento', icon: '💸' },
    { id: 18, name: 'Altro', icon: '📦' }
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
  const [balanceCollapsed, setBalanceCollapsed] = useState(true);

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
      id: editingItem.id, // Preserva l'ID originale
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
  const currentMonthExpenses = useMemo(() => 
    expenses.filter(expense => expense.date.startsWith(currentMonth)), 
    [expenses, currentMonth]
  );
  const currentMonthIncomes = useMemo(() => 
    incomes.filter(income => income.date.startsWith(currentMonth)), 
    [incomes, currentMonth]
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

  // Funzione per gestire i trasferimenti tra conti
  const handleTransfer = (transferData) => {
    const { fromWalletId, toWalletId, amount } = transferData;
    const today = new Date().toISOString().split('T')[0];
    
    // Crea la transazione di uscita (spesa) dal conto di origine
    const outgoingTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      category: 'Trasferimento',
      date: today,
      store: 'Trasferimento',
      walletId: fromWalletId,
      type: 'expense'
    };
    
    // Crea la transazione di entrata (entrata) nel conto di destinazione
    const incomingTransaction = {
      id: Date.now() + 1, // ID diverso per evitare conflitti
      amount: parseFloat(amount),
      category: 'Trasferimento',
      date: today,
      store: 'Trasferimento',
      walletId: toWalletId,
      type: 'income'
    };
    
    // Aggiungi entrambe le transazioni
    setExpenses([...expenses, outgoingTransaction]);
    setIncomes([...incomes, incomingTransaction]);
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

  // Dati demo per testare l'app
  const demoData = {
    expenses: [
      // Gennaio: spese regolari e qualche picco
      { id: 1, amount: 45.50, category: 'Alimentari', date: '2025-01-03T00:00:00.000Z', store: 'Supermercato Coop', walletId: 'wallet-1' },
      { id: 2, amount: 120.00, category: 'Trasporti', date: '2025-01-04T00:00:00.000Z', store: 'Eni', walletId: 'wallet-1' },
      { id: 3, amount: 89.99, category: 'Shopping', date: '2025-01-05T00:00:00.000Z', store: 'Zara', walletId: 'wallet-1' },
      { id: 4, amount: 65.00, category: 'Intrattenimento', date: '2025-01-06T00:00:00.000Z', store: 'Cinema', walletId: 'wallet-1' },
      { id: 5, amount: 150.00, category: 'Bollette', date: '2025-01-10T00:00:00.000Z', store: 'Enel', walletId: 'wallet-1' },
      { id: 6, amount: 25.50, category: 'Alimentari', date: '2025-01-12T00:00:00.000Z', store: 'Pizzeria', walletId: 'wallet-2' },
      { id: 7, amount: 200.00, category: 'Shopping', date: '2025-01-13T00:00:00.000Z', store: 'Amazon', walletId: 'wallet-2' },
      { id: 8, amount: 80.00, category: 'Salute', date: '2025-01-14T00:00:00.000Z', store: 'Farmacia', walletId: 'wallet-2' },
      { id: 9, amount: 45.00, category: 'Trasporti', date: '2025-01-15T00:00:00.000Z', store: 'ATM', walletId: 'wallet-3' },
      { id: 10, amount: 180.00, category: 'Educazione', date: '2025-01-16T00:00:00.000Z', store: 'Libreria', walletId: 'wallet-3' },
      { id: 11, amount: 95.00, category: 'Intrattenimento', date: '2025-01-17T00:00:00.000Z', store: 'Ristorante', walletId: 'wallet-3' },
      { id: 12, amount: 75.00, category: 'Alimentari', date: '2025-01-18T00:00:00.000Z', store: 'Carrefour', walletId: 'wallet-1' },
      { id: 13, amount: 300.00, category: 'Shopping', date: '2025-01-19T00:00:00.000Z', store: 'Ikea', walletId: 'wallet-2' },
      { id: 14, amount: 60.00, category: 'Trasporti', date: '2025-01-20T00:00:00.000Z', store: 'Trenitalia', walletId: 'wallet-1' },
      { id: 15, amount: 40.00, category: 'Intrattenimento', date: '2025-01-21T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-3' },
      { id: 16, amount: 15.99, category: 'Abbonamenti', date: '2025-01-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 17, amount: 9.99, category: 'Abbonamenti', date: '2025-01-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      // Febbraio: meno spese, ma una spesa grande
      { id: 18, amount: 85.00, category: 'Alimentari', date: '2025-02-02T00:00:00.000Z', store: 'Esselunga', walletId: 'wallet-1' },
      { id: 19, amount: 120.00, category: 'Trasporti', date: '2025-02-03T00:00:00.000Z', store: 'Autostrade', walletId: 'wallet-1' },
      { id: 20, amount: 250.00, category: 'Shopping', date: '2025-02-04T00:00:00.000Z', store: 'H&M', walletId: 'wallet-2' },
      { id: 21, amount: 35.00, category: 'Intrattenimento', date: '2025-02-05T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-3' },
      { id: 22, amount: 180.00, category: 'Bollette', date: '2025-02-06T00:00:00.000Z', store: 'TIM', walletId: 'wallet-1' },
      { id: 23, amount: 15.99, category: 'Abbonamenti', date: '2025-02-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 24, amount: 9.99, category: 'Abbonamenti', date: '2025-02-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      // Marzo: solo spese ricorrenti e una spesa imprevista
      { id: 25, amount: 15.99, category: 'Abbonamenti', date: '2025-03-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 26, amount: 9.99, category: 'Abbonamenti', date: '2025-03-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      { id: 27, amount: 500.00, category: 'Salute', date: '2025-03-15T00:00:00.000Z', store: 'Farmacia', walletId: 'wallet-2' },
      // Aprile: spese basse, solo ricorrenti
      { id: 28, amount: 15.99, category: 'Abbonamenti', date: '2025-04-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 29, amount: 9.99, category: 'Abbonamenti', date: '2025-04-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      // Maggio: spese varie e un viaggio
      { id: 30, amount: 15.99, category: 'Abbonamenti', date: '2025-05-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 31, amount: 9.99, category: 'Abbonamenti', date: '2025-05-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      { id: 32, amount: 600.00, category: 'Trasporti', date: '2025-05-10T00:00:00.000Z', store: 'Trenitalia', walletId: 'wallet-1' },
      { id: 33, amount: 200.00, category: 'Shopping', date: '2025-05-11T00:00:00.000Z', store: 'Amazon', walletId: 'wallet-2' },
      // Estate: pochi movimenti, solo ricorrenti
      { id: 34, amount: 15.99, category: 'Abbonamenti', date: '2025-06-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 35, amount: 9.99, category: 'Abbonamenti', date: '2025-06-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      { id: 36, amount: 15.99, category: 'Abbonamenti', date: '2025-07-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 37, amount: 9.99, category: 'Abbonamenti', date: '2025-07-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      { id: 38, amount: 15.99, category: 'Abbonamenti', date: '2025-08-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 39, amount: 9.99, category: 'Abbonamenti', date: '2025-08-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      // Settembre: ritorno a scuola
      { id: 40, amount: 180.00, category: 'Educazione', date: '2025-09-10T00:00:00.000Z', store: 'Libreria', walletId: 'wallet-3' },
      // Ottobre: spese varie
      { id: 41, amount: 15.99, category: 'Abbonamenti', date: '2025-10-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 42, amount: 9.99, category: 'Abbonamenti', date: '2025-10-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      { id: 43, amount: 350.00, category: 'Shopping', date: '2025-10-15T00:00:00.000Z', store: 'Ikea', walletId: 'wallet-2' },
      // Novembre: spese basse
      { id: 44, amount: 15.99, category: 'Abbonamenti', date: '2025-11-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 45, amount: 9.99, category: 'Abbonamenti', date: '2025-11-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      // Dicembre: regali e feste
      { id: 46, amount: 15.99, category: 'Abbonamenti', date: '2025-12-01T00:00:00.000Z', store: 'Netflix', walletId: 'wallet-1' },
      { id: 47, amount: 9.99, category: 'Abbonamenti', date: '2025-12-01T00:00:00.000Z', store: 'Spotify', walletId: 'wallet-2' },
      { id: 48, amount: 500.00, category: 'Regali', date: '2025-12-20T00:00:00.000Z', store: 'Famiglia', walletId: 'wallet-1' },
      { id: 49, amount: 300.00, category: 'Shopping', date: '2025-12-22T00:00:00.000Z', store: 'Amazon', walletId: 'wallet-2' },
      { id: 50, amount: 100.00, category: 'Intrattenimento', date: '2025-12-31T00:00:00.000Z', store: 'Ristorante', walletId: 'wallet-3' },
    ],
    incomes: [
      // Stipendi regolari
      { id: 1, amount: 2500.00, category: 'Stipendio', date: '2025-01-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 2, amount: 2500.00, category: 'Stipendio', date: '2025-02-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 3, amount: 2500.00, category: 'Stipendio', date: '2025-03-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 4, amount: 2500.00, category: 'Stipendio', date: '2025-04-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 5, amount: 2500.00, category: 'Stipendio', date: '2025-05-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 6, amount: 2500.00, category: 'Stipendio', date: '2025-06-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 7, amount: 2500.00, category: 'Stipendio', date: '2025-07-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 8, amount: 2500.00, category: 'Stipendio', date: '2025-08-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 9, amount: 2500.00, category: 'Stipendio', date: '2025-09-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 10, amount: 2500.00, category: 'Stipendio', date: '2025-10-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 11, amount: 2500.00, category: 'Stipendio', date: '2025-11-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 12, amount: 2500.00, category: 'Stipendio', date: '2025-12-01T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      // Bonus e freelance
      { id: 13, amount: 500.00, category: 'Bonus', date: '2025-01-15T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 14, amount: 200.00, category: 'Bonus', date: '2025-03-10T00:00:00.000Z', store: 'Cliente A', walletId: 'wallet-2' },
      { id: 15, amount: 300.00, category: 'Freelance', date: '2025-02-20T00:00:00.000Z', store: 'Cliente B', walletId: 'wallet-2' },
      { id: 16, amount: 400.00, category: 'Freelance', date: '2025-05-15T00:00:00.000Z', store: 'Cliente B', walletId: 'wallet-2' },
      { id: 17, amount: 200.00, category: 'Investimenti', date: '2025-04-10T00:00:00.000Z', store: 'Banca', walletId: 'wallet-3' },
      { id: 18, amount: 150.00, category: 'Regali', date: '2025-12-24T00:00:00.000Z', store: 'Famiglia', walletId: 'wallet-1' },
      { id: 19, amount: 100.00, category: 'Vendite', date: '2025-06-10T00:00:00.000Z', store: 'Amazon', walletId: 'wallet-2' },
      { id: 20, amount: 200.00, category: 'Bonus', date: '2025-12-31T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 21, amount: 100.00, category: 'Bonus', date: '2025-07-15T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
      { id: 22, amount: 150.00, category: 'Bonus', date: '2025-10-10T00:00:00.000Z', store: 'Azienda SRL', walletId: 'wallet-1' },
    ],
    categories: {
      expense: [
        { id: 1, name: 'Alimentari', icon: '🍽️' },
        { id: 2, name: 'Trasporti', icon: '🚗' },
        { id: 3, name: 'Intrattenimento', icon: '🎮' },
        { id: 4, name: 'Shopping', icon: '🛍️' },
        { id: 5, name: 'Bollette', icon: '💡' },
        { id: 6, name: 'Salute', icon: '🏥' },
        { id: 7, name: 'Educazione', icon: '📚' },
        { id: 8, name: 'Trasferimento', icon: '💸' },
        { id: 9, name: 'Abbonamenti', icon: '📱' },
        { id: 10, name: 'Altro', icon: '📦' }
      ],
      income: [
        { id: 11, name: 'Stipendio', icon: '💼' },
        { id: 12, name: 'Freelance', icon: '💻' },
        { id: 13, name: 'Investimenti', icon: '📈' },
        { id: 14, name: 'Regali', icon: '🎁' },
        { id: 15, name: 'Vendite', icon: '🛒' },
        { id: 16, name: 'Bonus', icon: '🎯' },
        { id: 17, name: 'Trasferimento', icon: '💸' },
        { id: 18, name: 'Altro', icon: '📦' }
      ]
    },
    stores: [
      'Supermercato Coop', 'Eni', 'Zara', 'Cinema', 'Enel', 'Pizzeria', 'Amazon', 'Farmacia', 
      'ATM', 'Libreria', 'Ristorante', 'Carrefour', 'Ikea', 'Trenitalia', 'Netflix',
      'Azienda SRL', 'Cliente A', 'Banca', 'Famiglia', 'Esselunga', 'Autostrade', 'H&M', 'Spotify', 'TIM', 'Cliente B'
    ],
    wallets: [
      { id: 'wallet-1', name: 'Conto Principale', color: '#6366f1', balance: 0, initialBalance: 1000 },
      { id: 'wallet-2', name: 'Conto Risparmi', color: '#10b981', balance: 0, initialBalance: 500 },
      { id: 'wallet-3', name: 'Conto Investimenti', color: '#f59e42', balance: 0, initialBalance: 2000 }
    ]
  };

  // Funzione per caricare i dati demo
  const loadDemoData = () => {
    if (window.confirm('Vuoi caricare i dati demo? I dati esistenti verranno sostituiti.')) {
      console.log('Loading demo data...', demoData);
      
      setExpenses(demoData.expenses);
      setIncomes(demoData.incomes);
      setCategories(demoData.categories);
      setStores(demoData.stores);
      setWallets(demoData.wallets);
      setActiveWalletId('wallet-1');
      
      // Salva i dati demo nel localStorage
      localStorage.setItem('expenses', JSON.stringify(demoData.expenses));
      localStorage.setItem('incomes', JSON.stringify(demoData.incomes));
      localStorage.setItem('categories', JSON.stringify(demoData.categories));
      localStorage.setItem('stores', JSON.stringify(demoData.stores));
      localStorage.setItem('wallets', JSON.stringify(demoData.wallets));
      
      console.log('Demo data loaded and saved to localStorage');
      alert('Dati demo caricati con successo! Ora puoi esplorare tutte le funzionalità dell\'app.');
    }
  };

  return (
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 pt-28 pb-24">
      {/* Header con grafica trasparente */}
      <header className="fixed top-0 left-0 w-full z-30 py-6 animate-fade-in">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-blue-600/40 backdrop-blur-md border border-blue-700/60 rounded-2xl p-3 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Wallet className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold text-white animate-fade-in-up">
                  MoneyTracker
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={loadDemoData}
                  className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95"
                  title="Carica dati demo"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Balance Card con design moderno - PRIMA COSA */}
      <div className="max-w-md mx-auto px-6 pt-4 pb-6 animate-fade-in-up">
        <div className={`floating-card ${balanceCollapsed ? 'p-3' : 'p-6'} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 animate-bounce-in active:scale-95`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiggyBank className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bilancio Totale</h2>
              {balanceCollapsed && (
                <span className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </span>
              )}
            </div>
            <button
              onClick={() => setBalanceCollapsed(!balanceCollapsed)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 transform hover:scale-110 active:scale-95"
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
              <div className="text-center mt-4 animate-fade-in-up">
                <div className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </div>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-green-600 transform hover:scale-105 transition-all duration-200 active:scale-95">
                    <div className="flex items-center gap-1 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      Entrate
                    </div>
                    <div className="text-lg font-bold">{formatCurrency(totalIncomes)}</div>
                  </div>
                  <div className="text-red-600 transform hover:scale-105 transition-all duration-200 active:scale-95">
                    <div className="flex items-center gap-1 font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      Spese
                    </div>
                    <div className="text-lg font-bold">{formatCurrency(totalExpenses)}</div>
                  </div>
                </div>
              </div>

              {/* Sezione gestione conti */}
              <div className="mt-8 animate-fade-in-up">
                <WalletManager
                  wallets={getWalletsWithCalculatedBalance()}
                  onAdd={addWallet}
                  onEdit={editWallet}
                  onDelete={deleteWallet}
                  onTransfer={handleTransfer}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 -mt-6 relative z-10">

        {/* Content */}
        {activeTab === 'expenses' && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Le tue spese</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 active:scale-95"
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
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Le tue entrate</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-green-700/90 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 active:scale-95"
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
          <div className="animate-fade-in-up">
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
          <div className="space-y-8 animate-fade-in-up">
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
          <div className="animate-fade-in-up">
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
