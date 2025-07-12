import { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings, Wallet, PiggyBank, Sun, Moon, Tag, Database, LogOut, User, X, ArrowRight } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Statistics from './components/Statistics';
import CategoryManager from './components/CategoryManager';
import ConfirmDialog from './components/ConfirmDialog';
import DateRangePicker from './components/DateRangePicker';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import WalletManager from './components/WalletManager';
import DataManager from './components/DataManager';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
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
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f472b6', // rose
];

// Modello dati conto: { id, name, color, balance, initialBalance }
const defaultWallet = {
  name: 'Conto Principale',
  color: WALLET_COLORS[0],
  balance: 0,
  initialBalance: 0,
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const { 
    useCollectionData, 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    deleteMultipleDocuments,
    loadAllUserData,
    importUserData,
    loading: firestoreLoading,
    error: firestoreError
  } = useFirestore();
  
  // Stati per il tracking della sincronizzazione
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Stati per i dati Firebase
  const { data: expenses, loading: expensesLoading } = useCollectionData('expenses');
  const { data: incomes, loading: incomesLoading } = useCollectionData('incomes');
  const { data: categoriesData, loading: categoriesLoading } = useCollectionData('categories', null);
  const { data: storesData, loading: storesLoading } = useCollectionData('stores', null);
  const { data: walletsData, loading: walletsLoading } = useCollectionData('wallets', 'name');
  

  
  // Stati locali
  const [categories, setCategories] = useState(defaultCategories);
  const [stores, setStores] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [balanceCollapsed, setBalanceCollapsed] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [walletFormData, setWalletFormData] = useState({ name: '', color: WALLET_COLORS[0], balance: 0 });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: ''
  });

  // Sincronizza i dati Firebase con gli stati locali
  useEffect(() => {
    console.log('categoriesData changed:', categoriesData);
    console.log('categoriesData length:', categoriesData?.length);
    console.log('categoriesData type:', typeof categoriesData);
    console.log('categoriesData timestamp:', new Date().toISOString());
    
    if (categoriesData && categoriesData.length > 0) {
      const categoriesDoc = categoriesData[0];
      console.log('Setting categories from Firestore data:', categoriesDoc);
      console.log('categoriesDoc.expense:', categoriesDoc.expense);
      console.log('categoriesDoc.income:', categoriesDoc.income);
      
      if (categoriesDoc.expense && categoriesDoc.income) {
        console.log('Setting categories state with:', categoriesDoc);
        setCategories(categoriesDoc);
        setLastSyncTime(new Date().toISOString());
      } else {
        console.log('categoriesDoc missing expense or income, using defaults');
        setCategories(defaultCategories);
      }
    } else if (categoriesData && categoriesData.length === 0) {
      console.log('No categories data, using defaults');
      setCategories(defaultCategories);
    } else {
      console.log('categoriesData is null/undefined, using defaults');
      setCategories(defaultCategories);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (storesData && storesData.length > 0) {
      const storesDoc = storesData[0];
      if (storesDoc.stores) {
        setStores(storesDoc.stores);
      }
    }
  }, [storesData]);

  useEffect(() => {
    console.log('walletsData changed:', walletsData);
    console.log('walletsData timestamp:', new Date().toISOString());
    if (walletsData && walletsData.length > 0) {
      console.log('Setting wallets from Firestore data:', walletsData);
      setWallets(walletsData);
      setLastSyncTime(new Date().toISOString());
      if (walletsData.length > 0 && !activeWalletId) {
        setActiveWalletId(walletsData[0].id);
      }
    } else if (walletsData && walletsData.length === 0) {
      setWallets([]);
      setActiveWalletId(null);
    }
  }, [walletsData, activeWalletId]);

  // Inizializza i dati di default se l'utente è nuovo
  useEffect(() => {
    if (user && categoriesData.length === 0) {
      addDocument('categories', defaultCategories);
    }
    if (user && storesData.length === 0) {
      addDocument('stores', { stores: [] });
    }
  }, [user, categoriesData.length, storesData.length]);

  // Pulisci i conti con ID personalizzati (vecchi conti)
  useEffect(() => {
    if (user && walletsData.length > 0) {
      const walletsWithCustomIds = walletsData.filter(wallet => 
        wallet.id && wallet.id.startsWith('wallet-')
      );
      
      if (walletsWithCustomIds.length > 0) {
        console.log('Trovati conti con ID personalizzati da pulire:', walletsWithCustomIds);
        // Per ora, logghiamo solo. In futuro potremmo volerli migrare
        walletsWithCustomIds.forEach(wallet => {
          console.log('Conto con ID personalizzato:', wallet.name, wallet.id);
        });
      }
    }
  }, [user, walletsData]);



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
    console.log('getWalletsWithCalculatedBalance called with wallets:', wallets);
    const result = wallets.map(wallet => ({
      ...wallet,
      balance: calculateWalletBalance(wallet.id) // Sostituisce il saldo con quello calcolato
    }));
    console.log('getWalletsWithCalculatedBalance result:', result);
    return result;
  };

  // Aggiungi spesa/entrata associata a conto
  const addExpense = async (expense) => {
    const newExpense = { 
      ...expense, 
      date: expense.date ? new Date(expense.date + 'T00:00:00').toISOString() : new Date().toISOString() 
    };
    await addDocument('expenses', newExpense);
    setShowForm(false);
    setEditingItem(null);
  };
  
  const addIncome = async (income) => {
    const newIncome = { 
      ...income, 
      date: income.date ? new Date(income.date + 'T00:00:00').toISOString() : new Date().toISOString() 
    };
    await addDocument('incomes', newIncome);
    setShowForm(false);
    setEditingItem(null);
  };
  
  // Modifica transazione
  const updateItem = async (updatedItem) => {
    const updatedWithDate = {
      ...updatedItem,
      date: updatedItem.date ? new Date(updatedItem.date + 'T00:00:00').toISOString() : new Date().toISOString()
    };
    
    const collectionName = activeTab === 'expenses' ? 'expenses' : 'incomes';
    await updateDocument(collectionName, editingItem.id, updatedWithDate);
    
    setShowForm(false);
    setEditingItem(null);
  };
  
  // Elimina transazione (non wallet)
  const handleDelete = async (id) => {
    const collectionName = activeTab === 'expenses' ? 'expenses' : 'incomes';
    await deleteDocument(collectionName, id);
    setShowConfirmDelete(false);
    setItemToDelete(null);
  };
  // Elimina conto e tutte le transazioni collegate
  const deleteWallet = async (walletId) => {
    console.log('deleteWallet chiamato con walletId:', walletId);
    console.log('Tipo di walletId:', typeof walletId);
    console.log('Wallets disponibili:', wallets);
    
    const wallet = wallets.find(w => w.id === walletId);
    console.log('Wallet trovato:', wallet);
    
    if (!wallet) {
      console.error('Wallet non trovato');
      alert('Wallet non trovato. Riprova.');
      return;
    }
    
    // Verifica se l'ID è un ID personalizzato (vecchio formato)
    if (walletId.startsWith('wallet-')) {
      console.log('ATTENZIONE: Eliminando conto con ID personalizzato:', walletId);
      console.log('Questo potrebbe causare problemi di sincronizzazione');
    }
    
    // Ora l'ID del wallet è direttamente l'ID del documento Firestore
    console.log('Usando wallet ID per eliminazione:', walletId);
    
    try {
      await performWalletDeletion(walletId);
      console.log('deleteWallet completato con successo');
    } catch (error) {
      console.error('Errore in deleteWallet:', error);
      alert('Errore durante l\'eliminazione del conto: ' + error.message);
    }
  };

  const performWalletDeletion = async (walletId) => {
    console.log('performWalletDeletion chiamato con wallet ID:', walletId);
    console.log('Tipo di walletId in performWalletDeletion:', typeof walletId);
    
    try {
      // Trova il wallet per ottenere l'ID del documento Firestore
      const wallet = wallets.find(w => w.id === walletId);
      console.log('Wallet trovato in performWalletDeletion:', wallet);
      
      if (!wallet) {
        console.error('Wallet non trovato per eliminazione');
        throw new Error('Wallet non trovato per eliminazione');
      }
      
      // Usa l'ID del documento Firestore per eliminare il wallet
      console.log('Eliminando wallet dal database con ID:', walletId);
      await deleteDocument('wallets', walletId);
      console.log('Wallet eliminato con successo');
      
      // Elimina le transazioni collegate usando l'ID del wallet
      const walletExpenses = expenses.filter(e => e.walletId === walletId);
      const walletIncomes = incomes.filter(i => i.walletId === walletId);
      
      console.log('Spese collegate trovate:', walletExpenses.length);
      console.log('Entrate collegate trovate:', walletIncomes.length);
      
      if (walletExpenses.length > 0) {
        console.log('Eliminando', walletExpenses.length, 'spese collegate...');
        const expenseIds = walletExpenses.map(e => e.id);
        console.log('IDs spese da eliminare:', expenseIds);
        await deleteMultipleDocuments('expenses', expenseIds);
        console.log('Spese eliminate con successo');
      }
      
      if (walletIncomes.length > 0) {
        console.log('Eliminando', walletIncomes.length, 'entrate collegate...');
        const incomeIds = walletIncomes.map(i => i.id);
        console.log('IDs entrate da eliminare:', incomeIds);
        await deleteMultipleDocuments('incomes', incomeIds);
        console.log('Entrate eliminate con successo');
      }
      
      if (activeWalletId === walletId) {
        const remainingWallets = wallets.filter(w => w.id !== walletId);
        setActiveWalletId(remainingWallets[0]?.id || null);
        console.log('Active wallet aggiornato a:', remainingWallets[0]?.id || null);
      }
      
      console.log('Eliminazione wallet completata con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione del wallet:', error);
      console.error('Codice errore:', error.code);
      console.error('Messaggio errore:', error.message);
      throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const addCategory = async (name, icon, type) => {
    console.log('addCategory chiamato con:', { name, icon, type });
    console.log('categoriesData length:', categoriesData.length);
    console.log('Current categories:', categories);
    
    const newCategory = {
      id: Date.now(),
      name,
      icon
    };
    
    const updatedCategories = {
      ...categories,
      [type]: [...categories[type], newCategory]
    };
    
    console.log('Updated categories to save:', updatedCategories);
    
    // Se non ci sono ancora documenti categories, crea il primo documento
    if (categoriesData.length === 0) {
      console.log('Creating new categories document');
      await addDocument('categories', updatedCategories);
    } else {
      console.log('Updating existing categories document with ID:', categoriesData[0].id);
      await updateDocument('categories', categoriesData[0].id, updatedCategories);
    }
    
    // Non aggiornare lo stato locale - lascia che Firestore gestisca la sincronizzazione
    console.log('Category added successfully - waiting for Firestore sync');
  };

  const deleteCategory = async (id) => {
    const updatedCategories = {
      expense: categories.expense.filter(cat => cat.id !== id),
      income: categories.income.filter(cat => cat.id !== id)
    };
    
    // Se non ci sono ancora documenti categories, crea il primo documento
    if (categoriesData.length === 0) {
      await addDocument('categories', updatedCategories);
    } else {
      await updateDocument('categories', categoriesData[0].id, updatedCategories);
    }
    
    // Non aggiornare lo stato locale - lascia che Firestore gestisca la sincronizzazione
    console.log('Category deleted successfully - waiting for Firestore sync');
  };

  const editCategory = async (id, name, icon) => {
    const updatedCategories = {
      expense: categories.expense.map(cat => cat.id === id ? { ...cat, name, icon } : cat),
      income: categories.income.map(cat => cat.id === id ? { ...cat, name, icon } : cat)
    };
    
    // Se non ci sono ancora documenti categories, crea il primo documento
    if (categoriesData.length === 0) {
      await addDocument('categories', updatedCategories);
    } else {
      await updateDocument('categories', categoriesData[0].id, updatedCategories);
    }
    
    // Non aggiornare lo stato locale - lascia che Firestore gestisca la sincronizzazione
    console.log('Category edited successfully - waiting for Firestore sync');
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
  const addWallet = async (wallet) => {
    console.log('addWallet chiamato con:', wallet);
    console.log('User autenticato:', user);
    console.log('User UID:', user?.uid);
    
    try {
      // Controlla se esiste già un wallet con lo stesso nome
      const existingWallet = wallets.find(w => w.name === wallet.name);
      if (existingWallet) {
        console.log('Wallet con lo stesso nome già esistente:', existingWallet);
        throw new Error('Esiste già un conto con questo nome');
      }
      
      const newWallet = {
        ...wallet,
        // Non specificare un ID personalizzato, lascia che Firestore lo generi
        initialBalance: parseFloat(wallet.balance) || 0,
        balance: parseFloat(wallet.balance) || 0,
      };
      console.log('Nuovo wallet da creare:', newWallet);
      
      const result = await addDocument('wallets', newWallet);
      console.log('Wallet creato con successo:', result);
      console.log('Document ID generato da Firestore:', result.id);
      return result;
    } catch (error) {
      console.error('Errore durante la creazione del wallet:', error);
      console.error('Codice errore:', error.code);
      console.error('Messaggio errore:', error.message);
      throw error;
    }
  };
  
  const editWallet = async (updatedWallet) => {
    try {
      // Ora l'ID del wallet è direttamente l'ID del documento Firestore
      await updateDocument('wallets', updatedWallet.id, {
        ...updatedWallet,
        initialBalance: parseFloat(updatedWallet.balance) || 0,
      });
    } catch (error) {
      console.error('Errore durante la modifica del conto:', error);
      // Se il documento non esiste, prova a crearlo
      if (error.code === 'not-found') {
        console.log('Documento non trovato, creo nuovo conto...');
        await addWallet(updatedWallet);
      } else {
        throw error;
      }
    }
  };

  // Wallet form handlers
  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    console.log('handleWalletSubmit chiamato');
    console.log('walletFormData:', walletFormData);
    console.log('editingWallet:', editingWallet);
    console.log('User:', user);
    
    try {
      if (!user) {
        console.error('Utente non autenticato');
        alert('Utente non autenticato. Effettua nuovamente l\'accesso.');
        return;
      }
      
      if (!walletFormData.name.trim()) {
        console.error('Nome wallet vuoto');
        return;
      }
      
      if (editingWallet) {
        console.log('Modificando wallet esistente');
        await editWallet({ ...editingWallet, ...walletFormData });
        setEditingWallet(null);
      } else {
        console.log('Creando nuovo wallet');
        await addWallet(walletFormData);
      }
      
      console.log('Wallet salvato con successo');
      setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
      setShowWalletForm(false);
    } catch (error) {
      console.error('Errore durante il salvataggio del conto:', error);
      console.error('Codice errore:', error.code);
      console.error('Messaggio errore:', error.message);
      
      // Mostra messaggio specifico per duplicati
      if (error.message === 'Esiste già un conto con questo nome') {
        alert('Esiste già un conto con questo nome. Scegli un nome diverso.');
      } else {
        alert('Errore durante il salvataggio del conto. Riprova.');
      }
    }
  };

  const handleEditWallet = (wallet) => {
    try {
      console.log('handleEditWallet chiamato con wallet:', wallet);
      setEditingWallet(wallet);
      const balanceToShow = wallet.initialBalance !== undefined ? wallet.initialBalance : wallet.balance;
      setWalletFormData({ name: wallet.name, color: wallet.color, balance: balanceToShow });
      setShowWalletForm(true);
      console.log('showWalletForm impostato a true per modifica');
    } catch (error) {
      console.error('Errore durante l\'apertura del modal di modifica:', error);
    }
  };

  const handleAddWallet = () => {
    try {
      console.log('handleAddWallet chiamato');
      setEditingWallet(null);
      setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
      setShowWalletForm(true);
      console.log('showWalletForm impostato a true');
    } catch (error) {
      console.error('Errore durante l\'apertura del modal di aggiunta:', error);
    }
  };

  // Funzione per gestire i trasferimenti tra conti
  const handleTransfer = async (transferData) => {
    const { fromWalletId, toWalletId, amount } = transferData;
    const today = new Date().toISOString().split('T')[0];
    
    // Crea la transazione di uscita (spesa) dal conto di origine
    const outgoingTransaction = {
      amount: parseFloat(amount),
      category: 'Trasferimento',
      date: today,
      store: 'Trasferimento',
      walletId: fromWalletId,
      type: 'expense'
    };
    
    // Crea la transazione di entrata (entrata) nel conto di destinazione
    const incomingTransaction = {
      amount: parseFloat(amount),
      category: 'Trasferimento',
      date: today,
      store: 'Trasferimento',
      walletId: toWalletId,
      type: 'income'
    };
    
    // Aggiungi entrambe le transazioni
    await addDocument('expenses', outgoingTransaction);
    await addDocument('incomes', incomingTransaction);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferFormData.fromWalletId || !transferFormData.toWalletId || !transferFormData.amount || transferFormData.fromWalletId === transferFormData.toWalletId) {
      return;
    }
    
    handleTransfer(transferFormData);
    setTransferFormData({ fromWalletId: '', toWalletId: '', amount: '' });
    setShowTransferModal(false);
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowTransferModal = () => {
    setShowTransferModal(true);
  };

  // Funzione per importare i dati
  const importData = async (data) => {
    try {
      await importUserData(data);
      alert('Dati importati con successo!');
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      alert('Errore durante l\'importazione dei dati.');
    }
  };
  // deleteWallet = (id) => { // This function is now handled by the new updateAllWalletsBalance
  //   setWallets(wallets.filter(w => w.id !== id));
  //   // TODO: elimina anche tutte le transazioni collegate a questo portafoglio
  //   if (activeWalletId === id) {
  //     setActiveWalletId(wallets[0]?.id || 'wallet-1');
  //   }
  // };





  // Mostra loading mentre verifica l'autenticazione
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Mostra login se l'utente non è autenticato
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 pt-28 pb-24">
      {/* Header con grafica trasparente */}
      <header className="fixed top-0 left-0 w-full z-30 py-6 animate-fade-in">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-blue-600/40 backdrop-blur-md border border-blue-700/60 rounded-2xl p-3 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold text-white animate-fade-in-up flex-shrink-0">
                  MoneyTracker
                </h1>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUserProfile(true)}
                    className="w-7 h-7 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <span className="text-white text-xs font-semibold">
                      {(() => {
                        const name = user.displayName || user.email;
                        const words = name.split(' ').filter(word => word.length > 0);
                        if (words.length >= 2) {
                          return (words[0][0] + words[1][0]).toUpperCase();
                        } else if (words.length === 1) {
                          return words[0].substring(0, 2).toUpperCase();
                        } else {
                          return name.substring(0, 2).toUpperCase();
                        }
                      })()}
                    </span>
                  </button>
                </div>
                {/* Indicatore di sincronizzazione */}
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${lastSyncTime ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} title={lastSyncTime ? `Ultima sincronizzazione: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Sincronizzazione in corso...'} />
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95 flex-shrink-0"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
              {balanceCollapsed && !expensesLoading && !incomesLoading && (
                <span className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </span>
              )}
              {(expensesLoading || incomesLoading) && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                {(() => {
                  const walletsWithBalance = getWalletsWithCalculatedBalance();
                  console.log('Wallets being passed to WalletManager:', walletsWithBalance);
                  return (
                    <WalletManager
                      wallets={walletsWithBalance}
                      onAdd={addWallet}
                      onEdit={editWallet}
                      onDelete={deleteWallet}
                      onTransfer={handleTransfer}
                      onShowForm={handleAddWallet}
                      onEditWallet={handleEditWallet}
                      onShowTransferModal={handleShowTransferModal}
                    />
                  );
                })()}
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

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Wallet Manager Modal */}
      {showWalletForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={() => {
                  setShowWalletForm(false);
                  setEditingWallet(null);
                  setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
                }} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{editingWallet ? 'Modifica' : 'Aggiungi'} Conto</h2>
                <div className="w-6"></div>
              </div>
            </div>
            <form onSubmit={handleWalletSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Nome</label>
                <input type="text" value={walletFormData.name} onChange={e => setWalletFormData({ ...walletFormData, name: e.target.value })} placeholder="Nome conto" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Colore</label>
                <div className="flex gap-2 flex-wrap">
                  {WALLET_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setWalletFormData({ ...walletFormData, color })} className={`w-8 h-8 rounded-full border-2 ${walletFormData.color === color ? 'border-primary scale-110' : 'border-transparent'} transition-all`} style={{ background: color }}></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Saldo iniziale</label>
                <input type="number" value={walletFormData.balance} onChange={e => setWalletFormData({ ...walletFormData, balance: parseFloat(e.target.value) || 0 })} className="input" step="0.01" required placeholder="0,00" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => {
                  setShowWalletForm(false);
                  setEditingWallet(null);
                  setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
                }} className="btn btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1">{editingWallet ? 'Modifica' : 'Aggiungi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={() => {
                  setShowTransferModal(false);
                  setTransferFormData({ fromWalletId: '', toWalletId: '', amount: '' });
                }} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Trasferimento tra Conti</h2>
                <div className="w-6"></div>
              </div>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Conto di origine</label>
                <select
                  name="fromWalletId"
                  value={transferFormData.fromWalletId}
                  onChange={handleTransferChange}
                  className="input"
                  required
                >
                  <option value="">Seleziona conto di origine</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({formatCurrency(wallet.balance)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Conto di destinazione</label>
                <select
                  name="toWalletId"
                  value={transferFormData.toWalletId}
                  onChange={handleTransferChange}
                  className="input"
                  required
                >
                  <option value="">Seleziona conto di destinazione</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({formatCurrency(wallet.balance)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Importo</label>
                <input
                  type="number"
                  name="amount"
                  value={transferFormData.amount}
                  onChange={handleTransferChange}
                  placeholder="0,00"
                  step="0.01"
                  className="input"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => {
                  setShowTransferModal(false);
                  setTransferFormData({ fromWalletId: '', toWalletId: '', amount: '' });
                }} className="btn btn-secondary flex-1">Annulla</button>
                <button type="submit" disabled={!transferFormData.fromWalletId || !transferFormData.toWalletId || !transferFormData.amount || transferFormData.fromWalletId === transferFormData.toWalletId} className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1">Trasferisci</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
