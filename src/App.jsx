import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Settings, Wallet, PiggyBank, Sun, Moon, Tag, Database, LogOut, User, X, ArrowRight, Loader2, Palette, Filter, Trash2, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Statistics from './components/Statistics';
import CategoryManager from './components/CategoryManager';
import ConfirmDialog from './components/ConfirmDialog';
import DateRangePicker from './components/DateRangePicker';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import { useScrollLock } from './hooks/useScrollLock';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import WalletManager from './components/WalletManager';
import DataManager from './components/DataManager';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import FilterDialog from './components/FilterDialog';
import { formatCurrency } from './utils/formatters';
import TransactionDetailDialog from './components/TransactionDetailDialog';
import { getEasterEgg, getAllEasterEggs, activateEasterEgg, saveEasterEggCompletion, getEasterEggsWithCompletionStatus } from './utils/easterEggs';
import { addCategory, editCategory, deleteCategory, validateCategory } from './features/categories/categoryLogic';
import { addWallet as addWalletLogic, editWallet as editWalletLogic, deleteWallet as deleteWalletLogic, validateWallet, calculateWalletBalance } from './features/wallets/walletLogic';
import { addExpense as addExpenseLogic, editExpense, deleteExpense, validateExpense } from './features/expenses/expenseLogic';
import { addIncome as addIncomeLogic, editIncome, deleteIncome, validateIncome } from './features/expenses/incomeLogic';

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
  'rainbow', // colore personalizzato
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
    setEasterEggCompleted,
    loading: firestoreLoading,
    error: firestoreError,
    getCompletedEasterEggs,
    deleteAllUserData,
    sanitizeStores,
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#6366f1');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    timeRange: 'all',
    startDate: '',
    endDate: '',
    selectedCategories: [],
    selectedStores: [],
    selectedWallets: []
  });
  const [showFloatingMenu, setShowFloatingMenu] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true); // Di default è espanso
  const [scrollDirection, setScrollDirection] = useState('down');
  const [rainbowMode, setRainbowMode] = useState(false);
  const [partyMode, setPartyMode] = useState(false);
  const [retroMode, setRetroMode] = useState(false);
  const [walletTapCount, setWalletTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastPartyTime, setLastPartyTime] = useState(0);
  const [lastFooterTapTime, setLastFooterTapTime] = useState(0);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressTimer = useRef(null);
  const progressTimer = useRef(null);
  const [flameMode, setFlameMode] = useState(false);
  const [angelicMode, setAngelicMode] = useState(false);
  const [timeTravelMode, setTimeTravelMode] = useState(false);
  const [fogliaOroMode, setFogliaOroMode] = useState(false);
  const [nataleMagicoMode, setNataleMagicoMode] = useState(false);
  const [compleannoSpecialeMode, setCompleannoSpecialeMode] = useState(false);
  
  // Stati per modal dei componenti figli
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', icon: '📦' });
  const [categoryType, setCategoryType] = useState('expense');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  // Stato per il dialog di dettaglio transazione
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [loadEasterEggsWithStatusFn, setLoadEasterEggsWithStatusFn] = useState(null);
  const [easterEggsWithStatus, setEasterEggsWithStatus] = useState([]);

  // Determina se almeno un modal è aperto
  const isAnyModalOpen = showForm || showConfirmDelete || showUserProfile || 
    showWalletForm || showTransferModal || showColorPicker || showCategoryForm || 
    showImportModal || showResetModal || showFilterDialog || showTransactionDialog;

  // Blocca lo scroll quando un modal è aperto
  useScrollLock(isAnyModalOpen);

  // Mantieni l'header espanso quando un modal è aperto
  useEffect(() => {
    if (isAnyModalOpen) {
      setIsHeaderExpanded(true);
      setShowFloatingMenu(true);
    }
  }, [isAnyModalOpen]);

  // Inizializza i filtri con tutti i wallets selezionati quando i wallets cambiano
  useEffect(() => {
    if (wallets.length > 0) {
      setActiveFilters(prev => ({
        ...prev,
        selectedWallets: wallets.map(w => w.id)
      }));
    }
  }, [wallets]);

  // 1. Tap segreto portafoglio
  const walletTapTimer = useRef(null);
  // Blocca doppio trigger rainbow
  const isRainbowToggling = useRef(false);
  const handleWalletTap = () => {
    setWalletTapCount(prev => {
      const now = Date.now();
      if (now - lastTapTime > 2000) {
        setLastTapTime(now);
        return 1;
      }
      const newCount = prev + 1;
      setLastTapTime(now);
      if (newCount >= 5) {
        if (!isRainbowToggling.current) {
          isRainbowToggling.current = true;
          activateExclusiveMode('rainbow');
          setTimeout(() => { isRainbowToggling.current = false; }, 500);
        }
        return 0;
      }
      return newCount;
    });
  };

  // 2. Doppio tap/click footer custom
  const [footerTapCount, setFooterTapCount] = useState(0);
  const footerTapTimer = useRef(null);
  // Blocca doppio trigger retro
  const isRetroToggling = useRef(false);
  const handleFooterTap = () => {
    setFooterTapCount(prev => {
      if (prev === 0) {
        if (footerTapTimer.current) clearTimeout(footerTapTimer.current);
        footerTapTimer.current = setTimeout(() => setFooterTapCount(0), 400);
        return 1;
      } else {
        setFooterTapCount(0);
        if (!isRetroToggling.current) {
          isRetroToggling.current = true;
          activateExclusiveMode('retro');
          setTimeout(() => { isRetroToggling.current = false; }, 500);
        }
        return 0;
      }
    });
  };

  // 3. Long press titolo robusto
  const [isLongPressing, setIsLongPressing] = useState(false);
  const handleLongPressStart = (event) => {
    if (event.target.closest('.app-title')) {
      setIsLongPressing(true);
      setLongPressProgress(0);
      progressTimer.current = setInterval(() => {
        setLongPressProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer.current);
            return 100;
          }
          return prev + 3.33;
        });
      }, 100);
      longPressTimer.current = setTimeout(() => {
        activateExclusiveMode('party');
        setIsLongPressing(false);
        setLongPressProgress(0);
      }, 3000);
    }
  };
  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    setLongPressProgress(0);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  // Funzione per aggiornare il colore della Dynamic Island e barra di stato
  const updateThemeColor = (isRainbow, currentTheme) => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) return;

    let newColor;
    if (isRainbow && currentTheme === 'dark') {
      // Tema scuro + arcobaleno
      newColor = '#271925'; // Colore personalizzato per il tema arcobaleno scuro
    } else if (isRainbow && currentTheme === 'light') {
      // Tema chiaro + arcobaleno
      newColor = '#FEEDD2'; // Colore personalizzato per il tema arcobaleno chiaro
    } else if (currentTheme === 'dark') {
      // Tema scuro normale
      newColor = '#111828'; // Colore scuro originale
    } else {
      // Tema chiaro normale
      newColor = '#FFFFFF'; // Colore bianco per il tema light
    }

    themeColorMeta.setAttribute('content', newColor);
  };

  // Sincronizza i dati Firebase con gli stati locali
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      const categoriesDoc = categoriesData[0];
      if (categoriesDoc.expense && categoriesDoc.income) {
        setCategories(categoriesDoc);
        setLastSyncTime(new Date().toISOString());
      } else {
        setCategories(defaultCategories);
      }
    } else if (categoriesData && categoriesData.length === 0) {
      setCategories(defaultCategories);
    } else {
      setCategories(defaultCategories);
    }
  }, [categoriesData]);

  useEffect(() => {
    let storesDoc = null;
    if (storesData && storesData.length > 0) {
      // Cerca il documento con id === 'default'
      storesDoc = storesData.find(doc => doc.id === 'default') || storesData[0];
      if (storesDoc.stores) {
        setStores(storesDoc.stores);
        setLastSyncTime(new Date().toISOString());
      } else {
        setStores([]);
      }
    } else if (storesData && storesData.length === 0) {
      setStores([]);
    } else {
      setStores([]);
    }
  }, [storesData]);

  useEffect(() => {
    if (walletsData && walletsData.length > 0) {
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
        walletsWithCustomIds.forEach(wallet => {
          console.log('Conto con ID personalizzato:', wallet.name, wallet.id);
        });
      }
    }
  }, [user, walletsData]);

  // Aggiorna il colore della Dynamic Island quando cambia il tema
  useEffect(() => {
    updateThemeColor(rainbowMode, theme);
  }, [rainbowMode, theme]);

  // Gestione classe party-mode sul body
  useEffect(() => {
    const body = document.body;
    if (partyMode) {
      body.classList.add('party-mode');
    } else {
      body.classList.remove('party-mode');
    }
  }, [partyMode]);

  // Gestione classe retro-mode sul body
  useEffect(() => {
    const body = document.body;
    if (retroMode) {
      body.classList.add('retro-mode');
    } else {
      body.classList.remove('retro-mode');
    }
  }, [retroMode]);



  // Aggiorna il colore della Dynamic Island all'avvio dell'app
  useEffect(() => {
    updateThemeColor(rainbowMode, theme);
  }, []);

  // Gestione easter egg - Long press sul titolo per party mode
  const handleTouchStart = (event) => {
    // Solo per il titolo dell'app
    if (event.target.closest('.app-title')) {
      // Reset progress
      setLongPressProgress(0);
      
      // Avvia timer di progresso (ogni 100ms)
      progressTimer.current = setInterval(() => {
        setLongPressProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer.current);
            return 100;
          }
          return prev + 3.33; // 100% in 3 secondi (100/30 = 3.33)
        });
      }, 100);

      longPressTimer.current = setTimeout(async () => {
        setPartyMode(prev => !prev);
        setLastPartyTime(Date.now());
        
        if (!partyMode) {
          // Attiva modalità party usando il nuovo sistema
          const setters = {
            setRainbowMode,
            setPartyMode,
            setRetroMode,
            setFlameMode,
            setAngelicMode,
            setTimeTravelMode,
            setFogliaOroMode,
            setNataleMagicoMode,
            setCompleannoSpecialeMode
          };
          
          activateEasterEgg('tapLungo', setters);
          
          // Salva il completamento nel database
          await saveEasterEggCompletion('tapLungo', setEasterEggCompleted);
          // Piccolo delay per assicurarsi che il database sia aggiornato
          await new Promise(resolve => setTimeout(resolve, 100));
          await loadEasterEggsWithStatus();
          
          const easterEgg = getEasterEgg('tapLungo');
          if (easterEgg) {
            setTimeout(() => {
              alert(easterEgg.activationMessage);
            }, 100);
          }
        } else {
          // Disattiva modalità party silenziosamente
        }
        
        // Reset progress
        setLongPressProgress(0);
      }, 3000); // 3 secondi di tap lungo
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    // Reset progress
    setLongPressProgress(0);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    // Reset progress
    setLongPressProgress(0);
  };

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
    const result = wallets.map(wallet => ({
      ...wallet,
      balance: calculateWalletBalance(wallet.id) // Sostituisce il saldo con quello calcolato
    }));
    return result;
  };

  // Aggiungi spesa/entrata associata a conto
  const addExpense = async (expense) => {
    const newExpense = { 
      ...expense, 
      date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString() 
    };
    
    // Controlla se la transazione attiva un easter egg (solo per salvare il completamento)
    const transactionDate = new Date(expense.date);
    const isTimeTravelDate = transactionDate.getFullYear() === 1999 && 
                            transactionDate.getMonth() === 11 && 
                            transactionDate.getDate() === 31;
    const isNataleDate = transactionDate.getMonth() === 11 && 
                        transactionDate.getDate() === 25;
    const isCompleannoDate = transactionDate.getMonth() === 5 && 
                            transactionDate.getDate() === 5;
    
    let activatedEgg = null;
    if (isTimeTravelDate) {
      activatedEgg = 'timeTravel';
    } else if (isNataleDate) {
      activatedEgg = 'nataleMagico';
    } else if (isCompleannoDate) {
      activatedEgg = 'compleannoSpeciale';
    } else if (parseFloat(expense.amount) === 888) {
      activatedEgg = 'entrataAngelica';
    } else if (parseFloat(expense.amount) === 666) {
      activatedEgg = 'uscitaDiabolica';
    } else if (parseFloat(expense.amount) === 777) {
      activatedEgg = 'quadrifoglioFortunato';
    }
    
    // Salva il completamento easter egg se attivato
    if (activatedEgg) {
      const easterEgg = getEasterEgg(activatedEgg);
      if (easterEgg) {
        await saveEasterEggCompletion(activatedEgg, setEasterEggCompleted);
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadEasterEggsWithStatus();
        setTimeout(() => {
          alert(easterEgg.activationMessage);
        }, 100);
      }
    }
    
    // Sincronizza con Firestore
    await addDocument('expenses', newExpense, (updatedStores) => {
      if (Array.isArray(updatedStores)) setStores(updatedStores);
    });
    setShowForm(false);
    setEditingItem(null);
  };
  
  const addIncome = async (income) => {
    const newIncome = { 
      ...income, 
      date: income.date ? new Date(income.date).toISOString() : new Date().toISOString() 
    };
    
    // Controlla se la transazione attiva un easter egg (solo per salvare il completamento)
    const transactionDate = new Date(income.date);
    const isTimeTravelDate = transactionDate.getFullYear() === 1999 && 
                            transactionDate.getMonth() === 11 && 
                            transactionDate.getDate() === 31;
    const isNataleDate = transactionDate.getMonth() === 11 && 
                        transactionDate.getDate() === 25;
    const isCompleannoDate = transactionDate.getMonth() === 5 && 
                            transactionDate.getDate() === 5;
    
    let activatedEgg = null;
    if (isTimeTravelDate) {
      activatedEgg = 'timeTravel';
    } else if (isNataleDate) {
      activatedEgg = 'nataleMagico';
    } else if (isCompleannoDate) {
      activatedEgg = 'compleannoSpeciale';
    } else if (parseFloat(income.amount) === 888) {
      activatedEgg = 'entrataAngelica';
    } else if (parseFloat(income.amount) === 666) {
      activatedEgg = 'uscitaDiabolica';
    } else if (parseFloat(income.amount) === 777) {
      activatedEgg = 'quadrifoglioFortunato';
    }
    
    // Salva il completamento easter egg se attivato
    if (activatedEgg) {
      const easterEgg = getEasterEgg(activatedEgg);
      if (easterEgg) {
        await saveEasterEggCompletion(activatedEgg, setEasterEggCompleted);
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadEasterEggsWithStatus();
        setTimeout(() => {
          alert(easterEgg.activationMessage);
        }, 100);
      }
    }
    
    await addDocument('incomes', newIncome, (updatedStores) => {
      if (Array.isArray(updatedStores)) setStores(updatedStores);
    });
    setShowForm(false);
    setEditingItem(null);
  };
  
  // Modifica transazione
  const updateItem = async (updatedItem) => {
    const updatedWithDate = {
      ...updatedItem,
      date: updatedItem.date ? new Date(updatedItem.date).toISOString() : new Date().toISOString()
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
    const wallet = wallets.find(w => w.id === walletId);
    
    if (!wallet) {
      alert('Wallet non trovato. Riprova.');
      return;
    }
    
    // Verifica se l'ID è un ID personalizzato (vecchio formato)
    if (typeof walletId === 'string' && walletId.startsWith('wallet-')) {
      console.log('ATTENZIONE: Eliminando conto con ID personalizzato:', walletId);
      console.log('Questo potrebbe causare problemi di sincronizzazione');
    }
    
    // Ora l'ID del wallet è direttamente l'ID del documento Firestore
    
    try {
      await performWalletDeletion(walletId);
    } catch (error) {
      console.error('Errore in deleteWallet:', error);
      alert('Errore durante l\'eliminazione del conto: ' + error.message);
    }
  };

  const performWalletDeletion = async (walletId) => {
    try {
      // Trova il wallet per ottenere l'ID del documento Firestore
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        throw new Error('Wallet non trovato per eliminazione');
      }
      
      // Usa l'ID del documento Firestore per eliminare il wallet
      await deleteDocument('wallets', walletId);
      
      // Elimina le transazioni collegate usando l'ID del wallet
      const walletExpenses = expenses.filter(e => e.walletId === walletId);
      const walletIncomes = incomes.filter(i => i.walletId === walletId);
      
      if (walletExpenses.length > 0) {
        const expenseIds = walletExpenses.map(e => e.id);
        await deleteMultipleDocuments('expenses', expenseIds);
      }
      
      if (walletIncomes.length > 0) {
        const incomeIds = walletIncomes.map(i => i.id);
        await deleteMultipleDocuments('incomes', incomeIds);
      }
      
      if (activeWalletId === walletId) {
        const remainingWallets = wallets.filter(w => w.id !== walletId);
        setActiveWalletId(remainingWallets[0]?.id || null);
      }
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

  // Gestione categorie (usando funzioni pure)
  const handleAddCategory = (type, newCategory) => {
    setCategories(prev => ({
      ...prev,
      [type]: addCategory(prev[type], newCategory)
    }));
  };

  const handleEditCategory = (type, id, updatedFields) => {
    setCategories(prev => ({
      ...prev,
      [type]: editCategory(prev[type], id, updatedFields)
    }));
  };

  const handleDeleteCategory = (type, id) => {
    setCategories(prev => ({
      ...prev,
      [type]: deleteCategory(prev[type], id)
    }));
  };

  const totalExpenses = expenses.filter(expense => expense.category !== 'Trasferimento').reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalIncomes = incomes.filter(income => income.category !== 'Trasferimento').reduce((sum, income) => sum + parseFloat(income.amount), 0);
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

  // Ottiene i dati filtrati (combina filtri attivi e date range)
  const getFilteredData = () => {
    let filteredExpenses = expenses;
    let filteredIncomes = incomes;

    // Filtro per tempo
    if (activeFilters.timeRange !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (activeFilters.timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          const dayOfWeek = now.getDay();
          const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
          endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case 'custom':
          if (activeFilters.startDate && activeFilters.endDate) {
            startDate = new Date(activeFilters.startDate);
            endDate = new Date(activeFilters.endDate);
            endDate.setDate(endDate.getDate() + 1); // Include end date
          }
          break;
      }

      if (startDate && endDate) {
        filteredExpenses = filteredExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate < endDate;
        });
        filteredIncomes = filteredIncomes.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate >= startDate && incomeDate < endDate;
        });
      }
    }

    // Filtro per categorie
    if (activeFilters.selectedCategories.length > 0) {
      filteredExpenses = filteredExpenses.filter(expense => 
        activeFilters.selectedCategories.includes(expense.category)
      );
      filteredIncomes = filteredIncomes.filter(income => 
        activeFilters.selectedCategories.includes(income.category)
      );
    }

    // Filtro per negozi
    if (activeFilters.selectedStores.length > 0) {
      filteredExpenses = filteredExpenses.filter(expense => 
        activeFilters.selectedStores.some(store => 
          expense.store && expense.store.toLowerCase().startsWith(store.toLowerCase())
        )
      );
      filteredIncomes = filteredIncomes.filter(income => 
        activeFilters.selectedStores.some(store => 
          income.store && income.store.toLowerCase().startsWith(store.toLowerCase())
        )
      );
    }

    // Filtro per conti
    if (activeFilters.selectedWallets && activeFilters.selectedWallets.length > 0) {
      filteredExpenses = filteredExpenses.filter(expense => 
        activeFilters.selectedWallets.includes(expense.walletId)
      );
      filteredIncomes = filteredIncomes.filter(income => 
        activeFilters.selectedWallets.includes(income.walletId)
      );
    }

    // Filtro per date range (se presente)
    if (dateRange) {
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = expense.date.split('T')[0];
        return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
      });
      
      filteredIncomes = filteredIncomes.filter(income => {
        const incomeDate = income.date.split('T')[0];
        return incomeDate >= dateRange.startDate && incomeDate <= dateRange.endDate;
      });
    }

    return { expenses: filteredExpenses, incomes: filteredIncomes };
  };

  const filteredData = getFilteredData();

  // Funzioni gestione conti
  const addWallet = async (wallet) => {
    try {
      // Usa la funzione pura per validare e aggiungere localmente
      const newWallets = addWalletLogic(wallets, wallet);
      setWallets(newWallets);
      // Sincronizza con Firestore
      const newWallet = newWallets.find(w => !wallets.some(ow => ow.id === w.id));
      const result = await addDocument('wallets', { ...newWallet, id: undefined }); // Firestore genera l'ID
      return result;
    } catch (error) {
      console.error('Errore durante la creazione del wallet:', error);
      throw error;
    }
  };
  
  const editWallet = async (updatedWallet) => {
    try {
      const newWallets = editWalletLogic(wallets, updatedWallet.id, updatedWallet);
      setWallets(newWallets);
      await updateDocument('wallets', updatedWallet.id, {
        ...updatedWallet,
        initialBalance: parseFloat(updatedWallet.balance) || 0,
      });
    } catch (error) {
      if (error.code === 'not-found') {
        await addWallet(updatedWallet);
      } else {
        throw error;
      }
    }
  };

  // Wallet form handlers
  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!user) {
        alert('Utente non autenticato. Effettua nuovamente l\'accesso.');
        return;
      }
      
      if (!walletFormData.name.trim()) {
        return;
      }
      
      if (editingWallet) {
        await editWallet({ ...editingWallet, ...walletFormData });
        setEditingWallet(null);
      } else {
        await addWallet(walletFormData);
      }
      
      setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
      setShowWalletForm(false);
    } catch (error) {
      console.error('Errore durante il salvataggio del conto:', error);
      
      // Mostra messaggio specifico per duplicati
      if (error.message === 'Esiste già un conto con questo nome') {
        alert('Esiste già un conto con questo nome. Scegli un nome diverso.');
      } else {
        alert('Errore durante il salvataggio del conto. Riprova.');
      }
    }
  };

  const handleEditWallet = (wallet) => {
    setEditingWallet(wallet);
    const balanceToShow = wallet.initialBalance !== undefined ? wallet.initialBalance : wallet.balance;
    setWalletFormData({ name: wallet.name, color: wallet.color, balance: balanceToShow });
    setShowWalletForm(true);
  };

  const handleAddWallet = () => {
    setEditingWallet(null);
    setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
    setShowWalletForm(true);
  };

  // Funzione per gestire i trasferimenti tra conti
  const handleTransfer = async (transferData) => {
    const { fromWalletId, toWalletId, amount } = transferData;
    const now = new Date().toISOString();
    
    // Crea la transazione di uscita (spesa) dal conto di origine
    const outgoingTransaction = {
      amount: parseFloat(amount),
      category: 'Trasferimento',
      date: now,
      store: 'Trasferimento',
      walletId: fromWalletId,
      type: 'expense'
    };
    
    // Crea la transazione di entrata (entrata) nel conto di destinazione
    const incomingTransaction = {
      amount: parseFloat(amount),
      category: 'Trasferimento',
      date: now,
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
      await importUserData(data, (updatedStores) => {
        if (Array.isArray(updatedStores)) setStores(updatedStores);
      });
      alert('Dati importati con successo!');
    } catch (error) {
      alert('Errore durante l\'importazione dei dati.');
    }
  };

  // Funzione per aggiungere un nuovo store
  const addStore = async (storeName) => {
    if (storeName.trim() && !stores.includes(storeName.trim())) {
      const newStores = [...stores, storeName.trim()];
      setStores(newStores);
      
      // Aggiorna Firestore
      if (storesData && storesData.length > 0) {
        const storesDoc = storesData[0];
        await updateDocument('stores', storesDoc.id, { stores: newStores });
      } else {
        // Se non esiste ancora un documento stores, crealo
        await addDocument('stores', { stores: newStores });
      }
    } else {
      console.log('Store già esistente o nome vuoto, non aggiunto');
    }
  };

  // Funzione per applicare i filtri
  const applyFilters = (filters) => {
    setActiveFilters(filters);
  };

  // Funzione per resettare tutti i dati
  const resetAllData = async () => {
    try {
      await deleteAllUserData();
      // Reset filtri attivi
      setActiveFilters({
        timeRange: 'all',
        startDate: '',
        endDate: '',
        selectedCategories: [],
        selectedStores: [],
        selectedWallets: []
      });
      alert('Tutti i dati sono stati eliminati con successo. L\'applicazione si ricaricherà automaticamente.');
      window.location.reload();
    } catch (error) {
      alert('Errore durante l\'eliminazione dei dati: ' + error.message);
    }
  };

  // Funzioni per gestire modal dei componenti figli
  const handleShowCategoryForm = (type, category = null) => {
    setCategoryType(type);
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({ name: category.name, icon: category.icon });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', icon: '📦' });
    }
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    if (editingCategory) {
      await editCategory(editingCategory.id, categoryFormData.name, categoryFormData.icon);
    } else {
      await addCategory(categoryFormData.name, categoryFormData.icon, categoryType);
    }
    
    setCategoryFormData({ name: '', icon: '📦' });
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCategoryCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', icon: '📦' });
  };

  const handleCategoryDelete = async () => {
    if (editingCategory) {
      await deleteCategory(editingCategory.id);
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', icon: '📦' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Se un modal è aperto, non gestire lo scroll
      if (isAnyModalOpen) {
        return;
      }

      const currentScrollY = window.scrollY;
      const isAtBottom = window.innerHeight + currentScrollY >= document.body.offsetHeight - 20;
      const collapseThreshold = 50; // Soglia per compattare l'header

      // Gestione header espandibile - Grande di default, si compatta quando scorri
      if (currentScrollY <= collapseThreshold) {
        setIsHeaderExpanded(true);
        setScrollDirection('up');
      } else {
        setIsHeaderExpanded(false);
        if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          setScrollDirection('down');
          setShowFloatingMenu(false); // scroll down, nascondi
        } else if (currentScrollY < lastScrollY.current && !isAtBottom) {
          setScrollDirection('up');
          setShowFloatingMenu(true); // scroll up, mostra SOLO se non sei in fondo
        } else {
          setScrollDirection('up'); // No scroll, reset direction
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAnyModalOpen]);

  const loadEasterEggsWithStatus = async () => {
    try {
      const eggsWithStatus = await getEasterEggsWithCompletionStatus(getCompletedEasterEggs);
      setEasterEggsWithStatus(eggsWithStatus);
    } catch (error) {
      console.error('Errore nel caricamento easter eggs:', error);
    }
  };

  // Hook per caricare gli easter eggs quando l'utente cambia
  useEffect(() => {
    if (user) loadEasterEggsWithStatus();
  }, [user]);

  // Hook per gestire la funzione di caricamento easter eggs in UserProfile
  useEffect(() => {
    if (showUserProfile && window.loadEasterEggsWithStatus) {
      setLoadEasterEggsWithStatusFn(() => window.loadEasterEggsWithStatus);
    }
  }, [showUserProfile]);

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

  // Funzione per mostrare il dettaglio di una transazione
  const handleShowDetail = (item, type) => {
    setSelectedTransaction({ ...item, _type: type });
    setShowTransactionDialog(true);
  };

  // Funzione per attivare modalità esclusiva
  const activateExclusiveMode = (mode) => {
    if (mode === 'rainbow') {
      if (rainbowMode) {
        setRainbowMode(false);
        setPartyMode(false);
        setRetroMode(false);
      } else {
        setRainbowMode(true);
        setPartyMode(false);
        setRetroMode(false);
        activateEasterEgg('tapSegreto', { setRainbowMode });
        saveEasterEggCompletion('tapSegreto', setEasterEggCompleted).then(() => loadEasterEggsWithStatus());
        const easterEgg = getEasterEgg('tapSegreto');
        if (easterEgg) setTimeout(() => alert(easterEgg.activationMessage), 100);
      }
    } else if (mode === 'party') {
      if (partyMode) {
        setRainbowMode(false);
        setPartyMode(false);
        setRetroMode(false);
      } else {
        setRainbowMode(false);
        setPartyMode(true);
        setRetroMode(false);
        activateEasterEgg('tapLungo', { setPartyMode });
        saveEasterEggCompletion('tapLungo', setEasterEggCompleted).then(() => loadEasterEggsWithStatus());
        const easterEgg = getEasterEgg('tapLungo');
        if (easterEgg) setTimeout(() => alert(easterEgg.activationMessage), 100);
      }
    } else if (mode === 'retro') {
      if (retroMode) {
        setRainbowMode(false);
        setPartyMode(false);
        setRetroMode(false);
      } else {
        setRainbowMode(false);
        setPartyMode(false);
        setRetroMode(true);
        activateEasterEgg('temaSegreto', { setRetroMode });
        saveEasterEggCompletion('temaSegreto', setEasterEggCompleted).then(() => loadEasterEggsWithStatus());
        const easterEgg = getEasterEgg('temaSegreto');
        if (easterEgg) setTimeout(() => alert(easterEgg.activationMessage), 100);
      }
    }
    setTimeout(() => {
    }, 200);
  };

  // Utility per device
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <div className={`min-h-screen ${rainbowMode ? 'bg-gradient-to-br from-red-100 via-yellow-100 via-green-100 via-blue-100 via-purple-100 to-pink-100 dark:from-red-900/20 dark:via-yellow-900/20 dark:via-green-900/20 dark:via-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20' : 'bg-white dark:bg-gray-900'} ${partyMode ? 'party-mode' : ''} ${retroMode ? 'retro-mode' : ''} transition-colors duration-200 pb-10 ${isHeaderExpanded ? 'pt-24' : 'pt-20'}`}>
      {/* Header espandibile con grafica trasparente */}
      <header className={`fixed top-0 left-0 w-full z-20 py-0 animate-fade-in header-transition header-parallax ${isHeaderExpanded ? 'h-20' : 'h-16'}`}>
        <div className="max-w-md mx-auto px-6 mt-2">
          <div className={`${rainbowMode ? 'bg-gradient-to-r from-red-500/50 via-yellow-500/50 via-green-500/50 via-blue-500/50 via-purple-500/50 to-pink-500/50' : 'bg-gradient-to-r from-blue-600/50 to-purple-600/50'} backdrop-blur-md border ${rainbowMode ? 'border-rainbow-500/40' : 'border-blue-500/40'} rounded-3xl transform hover:scale-102 header-content-transition hover:shadow-xl ${rainbowMode ? 'hover:shadow-rainbow-500/20' : 'hover:shadow-blue-500/20'} active:scale-98 ${isHeaderExpanded ? 'p-3' : 'p-2.5'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div 
                  className={`${isHeaderExpanded ? 'p-2.5' : 'p-2'} ${rainbowMode ? 'bg-gradient-to-r from-red-400/30 via-yellow-400/30 via-green-400/30 via-blue-400/30 via-purple-400/30 to-pink-400/30' : 'bg-white/25'} rounded-lg backdrop-blur-sm flex-shrink-0 shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}
                  {...(isTouchDevice ? { onTouchEnd: handleWalletTap } : { onClick: handleWalletTap })}
                  title={rainbowMode ? "Tap 5 volte rapidamente per disattivare il tema arcobaleno! 🌙" : "Tap 5 volte rapidamente per un easter egg! 🎉"}
                >
                  <Wallet className={`${isHeaderExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
                </div>
                <div className={`flex flex-col ${isHeaderExpanded ? 'gap-1' : 'gap-0'}`}>
                  <h1 
                    className={`app-title font-bold animate-fade-in-up flex-shrink-0 ${isHeaderExpanded ? 'text-xl' : 'text-lg'} tracking-tight cursor-pointer transition-all duration-100`}
                    style={{
                      color: isLongPressing || longPressProgress > 0 ? `hsl(${longPressProgress * 3.6}, 100%, 70%)` : 'white'
                    }}
                    onTouchStart={handleLongPressStart}
                    onTouchEnd={handleLongPressEnd}
                    onTouchMove={handleLongPressEnd}
                    onMouseDown={handleLongPressStart}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                  >
                    MoneyTracker
                  </h1>
                  {isHeaderExpanded && (
                    <p className="text-white/70 text-xs font-medium animate-fade-in-up tracking-wide">
                      {retroMode ? "Gestisci bene le tue finanze" : "Gestisci le tue finanze in modo intelligente"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowUserProfile(true)}
                    className={`${isHeaderExpanded ? 'w-8 h-8' : 'w-7 h-7'} ${easterEggsWithStatus && easterEggsWithStatus.length > 0 && easterEggsWithStatus.every(egg => egg.isCompleted) ? 'avatar-rainbow-star' : 'bg-white/25'} rounded-lg backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white/35 transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm`}
                  >
                    <span className={`text-white font-semibold ${isHeaderExpanded ? 'text-sm' : 'text-xs'}`}>
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
                  <div className={`${isHeaderExpanded ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full ${lastSyncTime ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse transition-all duration-200 shadow-sm`} title={lastSyncTime ? `Ultima sincronizzazione: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Sincronizzazione in corso...'} />
                </div>
                <button
                  onClick={toggleTheme}
                  className={`${isHeaderExpanded ? 'w-8 h-8' : 'w-7 h-7'} bg-white/25 rounded-lg backdrop-blur-sm hover:bg-white/35 transform hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm flex items-center justify-center`}
                >
                  {theme === 'dark' ? <Sun className={`${isHeaderExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-white`} /> : <Moon className={`${isHeaderExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-white`} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Balance Card con design moderno - PRIMA COSA */}
      <div className="max-w-md mx-auto px-6 mt-4 pb-6 animate-fade-in-up">
        <div className={`${rainbowMode ? 'bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 via-purple-500/20 to-pink-500/20 border border-rainbow-500/40 rounded-2xl' : 'floating-card'} ${balanceCollapsed ? 'p-3' : 'p-6'} transition-all duration-300 ${rainbowMode ? 'hover:shadow-2xl hover:shadow-rainbow-500/30' : 'hover:shadow-2xl hover:shadow-blue-500/20'} animate-bounce-in`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiggyBank className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{format(new Date(), 'MMMM yyyy', { locale: it }).replace(/^ /, c => c.toUpperCase())}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${(currentMonthIncomes.filter(i => i.category !== 'Trasferimento').reduce((sum, i) => sum + parseFloat(i.amount), 0) - currentMonthExpenses.filter(e => e.category !== 'Trasferimento').reduce((sum, e) => sum + parseFloat(e.amount), 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency((currentMonthIncomes.filter(i => i.category !== 'Trasferimento').reduce((sum, i) => sum + parseFloat(i.amount), 0) - currentMonthExpenses.filter(e => e.category !== 'Trasferimento').reduce((sum, e) => sum + parseFloat(e.amount), 0)))}
              </span>
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
          </div>
          
          {!balanceCollapsed && (
            <>
              <div className="text-center mt-4 animate-fade-in-up">
                <div className={`text-4xl font-bold mb-4 ${(currentMonthIncomes.filter(i => i.category !== 'Trasferimento').reduce((sum, i) => sum + parseFloat(i.amount), 0) - currentMonthExpenses.filter(e => e.category !== 'Trasferimento').reduce((sum, e) => sum + parseFloat(e.amount), 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency((currentMonthIncomes.filter(i => i.category !== 'Trasferimento').reduce((sum, i) => sum + parseFloat(i.amount), 0) - currentMonthExpenses.filter(e => e.category !== 'Trasferimento').reduce((sum, e) => sum + parseFloat(e.amount), 0)))}
                </div>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-green-600 transition-all duration-200">
                    <div className="flex items-center gap-1 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      Entrate
                    </div>
                    <div className="text-lg font-bold">{formatCurrency(currentMonthIncomes.filter(i => i.category !== 'Trasferimento').reduce((sum, i) => sum + parseFloat(i.amount), 0))}</div>
                  </div>
                  <div className="text-red-600 transition-all duration-200">
                    <div className="flex items-center gap-1 font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      Spese
                    </div>
                    <div className="text-lg font-bold">{formatCurrency(currentMonthExpenses.filter(e => e.category !== 'Trasferimento').reduce((sum, e) => sum + parseFloat(e.amount), 0))}</div>
                  </div>
                </div>
              </div>

              {/* Sezione gestione conti */}
              <div className="mt-8 animate-fade-in-up">
                {(() => {
                  const walletsWithBalance = getWalletsWithCalculatedBalance();
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

      <div className="max-w-md mx-auto px-6 py-4 -mt-6 relative z-10">

        {/* Content */}
                  {activeTab === 'expenses' && (
            <div className="animate-fade-in-up">
              <div className="sticky top-20 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Spese</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilterDialog(true)}
                      className={`flex items-center justify-center w-10 h-10 backdrop-blur-sm text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-2xl active:scale-95 ${
                        activeFilters.timeRange !== 'all' || 
                        activeFilters.selectedCategories.length > 0 || 
                        activeFilters.selectedStores.length > 0
                          ? 'bg-blue-600/90 hover:bg-blue-700/90 hover:shadow-blue-500/25'
                          : 'bg-gray-600/90 hover:bg-gray-700/90 hover:shadow-gray-500/25'
                      }`}
                      title="Filtri"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-medium">Nuovo</span>
                    </button>
                  </div>
                </div>
              </div>
            <ExpenseList
              items={filteredData.expenses}
              onDelete={confirmDelete}
              onEdit={handleEdit}
              type="expense"
              categories={categories.expense}
              onShowDetail={handleShowDetail}
            />
          </div>
        )}

                  {activeTab === 'incomes' && (
            <div className="animate-fade-in-up">
              <div className="sticky top-20 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entrate</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilterDialog(true)}
                      className={`flex items-center justify-center w-10 h-10 backdrop-blur-sm text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-2xl active:scale-95 ${
                        activeFilters.timeRange !== 'all' || 
                        activeFilters.selectedCategories.length > 0 || 
                        activeFilters.selectedStores.length > 0
                          ? 'bg-blue-600/90 hover:bg-blue-700/90 hover:shadow-blue-500/25'
                          : 'bg-gray-600/90 hover:bg-gray-700/90 hover:shadow-gray-500/25'
                      }`}
                      title="Filtri"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-green-700/90 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-medium">Nuovo</span>
                    </button>
                  </div>
                </div>
              </div>
            <ExpenseList
              items={filteredData.incomes}
              onDelete={confirmDelete}
              onEdit={handleEdit}
              type="income"
              categories={categories.income}
              onShowDetail={handleShowDetail}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="animate-fade-in-up">
            <div className="sticky top-20 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistiche</h2>
                <button
                  onClick={() => setShowFilterDialog(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    (activeFilters.timeRange !== 'all' || 
                     activeFilters.selectedCategories.length > 0 || 
                     activeFilters.selectedStores.length > 0)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filtri
                  {((activeFilters.timeRange !== 'all' || 
                     activeFilters.selectedCategories.length > 0 || 
                     activeFilters.selectedStores.length > 0)) && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-8">
              <Statistics
                expenses={filteredData.expenses}
                incomes={filteredData.incomes}
                currentMonthExpenses={currentMonthExpenses}
                currentMonthIncomes={currentMonthIncomes}
                categories={categories}
                stores={stores}
                activeFilters={activeFilters}
              />
            </div>
          </div>
        )}

                  {activeTab === 'categories' && (
            <div className="animate-fade-in-up">
              <div className="sticky top-20 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categorie</h2>
              </div>
            <div className="space-y-8">
              <CategoryManager
              categories={categories.expense}
              onAddCategory={(cat) => handleAddCategory('expense', cat)}
              onEditCategory={(id, fields) => handleEditCategory('expense', id, fields)}
              onDeleteCategory={(id) => handleDeleteCategory('expense', id)}
              type="expense"
              onShowForm={setShowCategoryForm}
            />
            <CategoryManager
              categories={categories.income}
              onAddCategory={(cat) => handleAddCategory('income', cat)}
              onEditCategory={(id, fields) => handleEditCategory('income', id, fields)}
              onDeleteCategory={(id) => handleDeleteCategory('income', id)}
              type="income"
              onShowForm={setShowCategoryForm}
            />
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="animate-fade-in-up">
            <div className="sticky top-20 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestione Dati</h2>
            </div>
            <DataManager 
              onImportData={importData} 
              onResetData={resetAllData} 
              onShowImportModal={() => setShowImportModal(true)}
              onShowResetModal={() => setShowResetModal(true)}
              onSanitizeStores={sanitizeStores}
            />
          </div>
        )}
      </div>

      {/* Navigation Tabs fluttuante in basso */}
      <div className={`fixed bottom-12 left-0 w-full z-30 py-3 transition-all duration-300 ${showFloatingMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-full pointer-events-none'}`}
      >
        <div className="max-w-md mx-auto px-6">
          <div className={`${rainbowMode ? 'bg-gradient-to-r from-red-500/30 via-yellow-500/30 via-green-500/30 via-blue-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-md border border-rainbow-500/40 rounded-2xl' : 'glass-card'} p-2`}>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'expenses'
                    ? `${rainbowMode ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' : 'tab-active'}`
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
                    ? `${rainbowMode ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' : 'tab-active'}`
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
                    ? `${rainbowMode ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' : 'tab-active'}`
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
                    ? `${rainbowMode ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' : 'tab-active'}`
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
                    ? `${rainbowMode ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' : 'tab-active'}`
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
        (() => {
          return (
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
              onAddStore={addStore}
            />
          );
        })()
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
        easterEggsWithStatus={easterEggsWithStatus}
      />

      {/* Wallet Manager Modal */}
      {showWalletForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={() => {
                  setShowWalletForm(false);
                  setEditingWallet(null);
                  setWalletFormData({ name: '', color: WALLET_COLORS[0], balance: 0 });
                }} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{editingWallet ? 'Modifica' : 'Nuovo'} Conto</h2>
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
                    <button 
                      key={color} 
                      type="button" 
                      onClick={() => {
                        if (color === 'rainbow') {
                          setShowColorPicker(true);
                        } else {
                          setWalletFormData({ ...walletFormData, color });
                        }
                      }} 
                      className={`w-8 h-8 rounded-full border-2 ${walletFormData.color === color ? 'border-primary scale-110' : 'border-transparent'} transition-all flex items-center justify-center`} 
                      style={{ 
                        background: color === 'rainbow' 
                          ? 'white' 
                          : color 
                      }}
                    >
                      {color === 'rainbow' && <Palette className="w-4 h-4 text-gray-600" />}
                    </button>
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
                <button type="submit" className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1">{editingWallet ? 'Modifica' : 'Nuovo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
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
                  {getWalletsWithCalculatedBalance().map(wallet => (
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
                  {getWalletsWithCalculatedBalance().map(wallet => (
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

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowColorPicker(false)} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Scegli Colore</h2>
                <div className="w-6"></div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Colore personalizzato</label>
                <input 
                  type="color" 
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowColorPicker(false)} className="btn btn-secondary flex-1">Annulla</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setWalletFormData({ ...walletFormData, color: customColor });
                    setShowColorPicker(false);
                  }} 
                  className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1"
                >
                  Conferma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={handleCategoryCancel} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">
                  {editingCategory ? 'Modifica' : 'Nuovo'} Categoria
                </h2>
                <div className="w-6"></div>
              </div>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Nome Categoria
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Nome categoria"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Icona
                </label>
                <div className="relative">
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto scrollbar-hide emoji-scroll-container">
                    {[
                      // Cibo e bevande
                      '🍽️', '🍔', '🍕', '🍣', '🍦', '🍰', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃',
                      // Trasporti
                      '🚗', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃',
                      // Shopping e acquisti
                      '🛍️', '🛒', '🛍️', '💄', '👗', '👠', '👡', '👢', '👕', '👖', '🧥', '🧦', '🧤', '🧣', '👒', '🎩', '👑', '💍', '💎', '💐', '🌹', '🌷', '🌼', '🌻', '🌺',
                      // Tecnologia
                      '💻', '🖥️', '⌨️', '🖱️', '📱', '📲', '📟', '📠', '🔋', '💡', '🔌', '🔌', '💻', '🖨️', '📷', '📹', '🎥', '📺', '📻', '🎙️', '🎚️', '🎛️', '📻', '📱', '📲',
                      // Casa e famiglia
                      '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏨', '🏪', '🏫', '🏩', '💒', '⛪', '🕌', '🕍', '🛕', '⛩️', '🕋', '⛲', '⛺', '🌁',
                      // Sport e attività
                      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎯', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽',
                      // Musica e intrattenimento
                      '🎸', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎻', '🪕', '🎬', '🎭', '🎨', '🎪', '🎟️', '🎫', '🎗️', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '⚱️',
                      // Animali e natura
                      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺',
                      // Viaggi e luoghi
                      '✈️', '🛩️', '🛫', '🛬', '🛰️', '🚀', '🛸', '🚁', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑',
                      // Salute e benessere
                      '🏥', '💊', '💉', '🩺', '🩹', '🩻', '🩼', '🩽', '🩾', '🩿', '🪑', '🪒', '🧴', '🧼', '🛁', '🚿', '🪣', '🧽', '🪞', '🪟', '🪠', '🪡', '🪢', '🪣', '🪤',
                      // Lavoro e ufficio
                      '💼', '📁', '📂', '📄', '📃', '📑', '📋', '📝', '✏️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑',
                      // Finanza e denaro
                      '💰', '🪙', '💴', '💵', '💶', '💷', '🪙', '💳', '🧾', '💸', '🪙', '💎', '💍', '💎', '💎', '💎', '💎', '💎', '💎', '💎', '💎', '💎', '💎', '💎', '💎',
                      // Educazione e studio
                      '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔', '📒', '📃', '📄', '📑', '🔖', '🏷️', '📎', '🖇️', '📐', '📏', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝',
                      // Tempo libero e hobby
                      '🎮', '🕹️', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎻', '🪕', '🎸', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎻'
                    ].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCategoryFormData({ ...categoryFormData, icon })}
                        className={`p-2 rounded-lg text-lg transition-all emoji-scroll-item ${
                          categoryFormData.icon === icon
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-secondary hover:bg-gray-100 dark:hover:bg-gray-700/80'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCategoryCancel} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200">
                  Annulla
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-purple-700/90 transition-all duration-200 transform hover:scale-105">
                  {editingCategory ? 'Modifica' : 'Nuovo'}
                </button>
              </div>

              {/* Pulsante elimina solo in modifica */}
              {editingCategory && (
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    onClick={handleCategoryDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina categoria
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowImportModal(false)} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Importa Dati</h2>
                <div className="w-6"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Seleziona File di Backup
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        try {
                          const data = JSON.parse(e.target.result);
                          importData(data);
                          setShowImportModal(false);
                        } catch (error) {
                          alert('Errore durante l\'importazione: ' + error.message);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-green-700/90 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span className="font-medium">Importa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowResetModal(false)} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Reset Completo
                </h2>
                <div className="w-6"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ATTENZIONE!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Stai per eliminare <strong>TUTTI</strong> i tuoi dati:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-6">
                  <li>• Tutte le spese e entrate</li>
                  <li>• Tutte le categorie personalizzate</li>
                  <li>• Tutti i negozi salvati</li>
                  <li>• Tutti i conti e saldi</li>
                  <li>• Tutte le impostazioni</li>
                </ul>
                <p className="text-red-600 font-semibold">
                  Questa azione è <strong>IRREVERSIBILE</strong> e non può essere annullata!
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setShowResetModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina Tutto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        onApplyFilters={applyFilters}
        categories={categories}
        activeTab={activeTab}
        stores={stores}
        wallets={getWalletsWithCalculatedBalance()}
      />

      {/* Footer con credits */}
      <footer 
        className={`fixed bottom-0 left-0 w-full ${rainbowMode ? 'bg-gradient-to-r from-red-500/80 via-yellow-500/80 via-green-500/80 via-blue-500/80 via-purple-500/80 to-pink-500/80 dark:from-red-900/80 dark:via-yellow-900/80 dark:via-blue-900/80 dark:via-purple-900/80 dark:to-pink-900/80' : 'bg-white/80 dark:bg-gray-900/80'} backdrop-blur-md border-t ${rainbowMode ? 'border-rainbow-500/40' : 'border-gray-200 dark:border-gray-700'} py-2 z-40 cursor-pointer hover:bg-opacity-90 transition-all duration-200`}
        onClick={handleFooterTap}
        onTouchEnd={handleFooterTap}
        title="Doppio tap per attivare il tema retro! 🎮"
      >
        <div className="max-w-md mx-auto px-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Sviluppato con ❤️ da <span className="font-semibold text-blue-600 dark:text-blue-400">Alex Siroli</span>
            </p>
          </div>
        </div>
      </footer>

      {showTransactionDialog && selectedTransaction && (
        <TransactionDetailDialog
          transaction={selectedTransaction}
          onClose={() => setShowTransactionDialog(false)}
          onEdit={() => { handleEdit(selectedTransaction); setShowTransactionDialog(false); }}
          onDelete={() => { confirmDelete(selectedTransaction.id); setShowTransactionDialog(false); }}
          categories={categories}
        />
      )}
    </div>
  );
}

export default App;
