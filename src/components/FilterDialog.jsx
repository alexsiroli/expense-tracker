import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, Store, Search, Filter, Clock, Wallet, ChevronDown, ChevronUp } from 'lucide-react';

function FilterDialog({ isOpen, onClose, onApplyFilters, categories = [], activeTab = 'expenses', stores = [], wallets = [] }) {
  // Ottieni le categorie appropriate basandosi sull'activeTab
  const getCategoriesForTab = () => {
    if (activeTab === 'stats') {
      return {
        expense: categories.expense || [],
        income: categories.income || []
      };
    } else if (activeTab === 'expenses') {
      return {
        expense: categories.expense || [],
        income: []
      };
    } else {
      return {
        expense: [],
        income: categories.income || []
      };
    }
  };

  const { expense: expenseCategories, income: incomeCategories } = getCategoriesForTab();
  const [filters, setFilters] = useState({
    transactionType: 'all', // 'all', 'expenses', 'incomes'
    timeRange: 'all', // all, today, week, month, year, custom
    startDate: '',
    endDate: '',
    selectedCategories: [],
    selectedStores: [],
    selectedWallets: wallets.map(w => w.id), // Di default tutti selezionati
    searchStore: ''
  });

  const [storeSuggestions, setStoreSuggestions] = useState([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    time: false,
    categories: false,
    wallets: false,
    stores: false
  });
  const storeSearchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Reset delle sezioni espanse quando il dialog si apre
  useEffect(() => {
    if (isOpen) {
      setExpandedSections({
        time: false,
        categories: false,
        wallets: false,
        stores: false
      });
    }
  }, [isOpen]);

  // Gestisce il click fuori dai suggerimenti per chiuderli
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          storeSearchRef.current && !storeSearchRef.current.contains(event.target)) {
        setShowStoreSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleTimeRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      timeRange: range,
      startDate: '',
      endDate: ''
    }));
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  const handleWalletToggle = (walletId) => {
    setFilters(prev => ({
      ...prev,
      selectedWallets: prev.selectedWallets.includes(walletId)
        ? prev.selectedWallets.filter(w => w !== walletId)
        : [...prev.selectedWallets, walletId]
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStoreSearch = (value) => {
    setFilters(prev => ({ ...prev, searchStore: value }));
    
    if (value.trim()) {
      const filtered = stores.filter(store => 
        store.toLowerCase().includes(value.toLowerCase())
      );
      
      // Ordina: prima quelli che iniziano con il testo, poi quelli che lo contengono
      const sorted = filtered.sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(value.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(value.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b, 'it', { sensitivity: 'base' });
      });
      
      setStoreSuggestions(sorted);
      setShowStoreSuggestions(true);
    } else {
      setStoreSuggestions([]);
      setShowStoreSuggestions(false);
    }
  };

  const handleStoreSelect = (store) => {
    if (!filters.selectedStores.includes(store)) {
      setFilters(prev => ({
        ...prev,
        selectedStores: [...prev.selectedStores, store],
        searchStore: ''
      }));
    }
    setShowStoreSuggestions(false);
  };

  const removeStore = (storeToRemove) => {
    setFilters(prev => ({
      ...prev,
      selectedStores: prev.selectedStores.filter(store => store !== storeToRemove)
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      transactionType: 'all',
      timeRange: 'all',
      startDate: '',
      endDate: '',
      selectedCategories: [],
      selectedStores: [],
      selectedWallets: wallets.map(w => w.id), // Reset a tutti selezionati
      searchStore: ''
    });
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case 'today': return 'Oggi';
      case 'week': return 'Questa settimana';
      case 'month': return 'Questo mese';
      case 'year': return 'Questo anno';
      case 'custom': return 'Personalizzato';
      default: return 'Tutti';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all duration-300 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtri
            </h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Toggle tipo transazione */}
        <div className="mt-4 mb-1 flex items-center justify-center">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-1 flex shadow-lg border border-gray-300 dark:border-gray-700 gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, transactionType: 'all' }))}
              className={`px-5 py-2 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:z-10
                ${filters.transactionType === 'all'
                  ? 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow-md scale-105 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/60 dark:hover:bg-gray-900/40'}
              `}
              style={{ marginRight: 2 }}
            >
              Tutte
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, transactionType: 'expenses' }))}
              className={`px-5 py-2 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:z-10
                ${filters.transactionType === 'expenses'
                  ? 'bg-white dark:bg-gray-900 text-red-700 dark:text-red-300 shadow-md scale-105 border border-red-200 dark:border-red-700'
                  : 'text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-300 hover:bg-white/60 dark:hover:bg-gray-900/40'}
              `}
              style={{ marginRight: 2, marginLeft: 2 }}
            >
              Spese
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, transactionType: 'incomes' }))}
              className={`px-5 py-2 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/60 focus:z-10
                ${filters.transactionType === 'incomes'
                  ? 'bg-white dark:bg-gray-900 text-green-700 dark:text-green-300 shadow-md scale-105 border border-green-200 dark:border-green-700'
                  : 'text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300 hover:bg-white/60 dark:hover:bg-gray-900/40'}
              `}
              style={{ marginLeft: 2 }}
            >
              Entrate
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Filtro per tempo */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('time')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Periodo</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto truncate text-right">
                  {getTimeRangeLabel(filters.timeRange)}
                </span>
              </div>
              {expandedSections.time ? <ChevronUp className="w-5 h-5 ml-2 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 ml-2 flex-shrink-0" />}
            </button>
            
            {expandedSections.time && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'Tutti' },
                    { value: 'today', label: 'Oggi' },
                    { value: 'week', label: 'Settimana' },
                    { value: 'month', label: 'Mese' },
                    { value: 'year', label: 'Anno' },
                    { value: 'custom', label: 'Personalizzato' }
                  ].map(range => (
                    <button
                      key={range.value}
                      onClick={() => handleTimeRangeChange(range.value)}
                      className={`p-2 text-sm font-medium transition-all ${
                        filters.timeRange === range.value
                          ? 'bg-blue-600 text-white rounded-xl'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Date personalizzate */}
                {filters.timeRange === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data inizio
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data fine
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="input w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtro per categorie */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Categorie</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto truncate text-right">
                  {filters.selectedCategories.length > 0 ? `${filters.selectedCategories.length} selezionate` : 'Tutte'}
                </span>
              </div>
              {expandedSections.categories ? <ChevronUp className="w-5 h-5 ml-2 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 ml-2 flex-shrink-0" />}
            </button>
            
            {expandedSections.categories && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {/* Categorie Spese */}
                  {expenseCategories.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {expenseCategories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.name)}
                          className={`p-2 text-sm font-medium transition-all flex items-center gap-1 ${
                            filters.selectedCategories.includes(category.name)
                              ? 'bg-red-600 text-white rounded-xl'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg'
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span className="truncate">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Linea separatrice se ci sono entrambi i tipi */}
                  {expenseCategories.length > 0 && incomeCategories.length > 0 && (
                    <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
                  )}

                  {/* Categorie Entrate */}
                  {incomeCategories.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {incomeCategories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.name)}
                          className={`p-2 text-sm font-medium transition-all flex items-center gap-1 ${
                            filters.selectedCategories.includes(category.name)
                              ? 'bg-green-600 text-white rounded-xl'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg'
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span className="truncate">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filtro per conti */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('wallets')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Conti</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto truncate text-right">
                  {filters.selectedWallets.length > 0 ? `${filters.selectedWallets.length} selezionati` : 'Tutti'}
                </span>
              </div>
              {expandedSections.wallets ? <ChevronUp className="w-5 h-5 ml-2 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 ml-2 flex-shrink-0" />}
            </button>
            
            {expandedSections.wallets && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {wallets.map(wallet => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletToggle(wallet.id)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                        filters.selectedWallets.includes(wallet.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: wallet.color === 'rainbow' ? '#6366f1' : wallet.color }}
                        />
                        <span className="truncate">{wallet.name}</span>
                      </div>
                      <span className="text-xs opacity-75">
                        {filters.selectedWallets.includes(wallet.id) ? 'Selezionato' : 'Non selezionato'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtro per negozi */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('stores')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Store className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Negozi</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto truncate text-right">
                  {filters.selectedStores.length > 0 ? `${filters.selectedStores.length} selezionati` : 'Tutti'}
                </span>
              </div>
              {expandedSections.stores ? <ChevronUp className="w-5 h-5 ml-2 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 ml-2 flex-shrink-0" />}
            </button>
            
            {expandedSections.stores && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {/* Ricerca negozi */}
                <div className="relative">
                  <input
                    ref={storeSearchRef}
                    type="text"
                    value={filters.searchStore}
                    onChange={(e) => handleStoreSearch(e.target.value)}
                    placeholder="Cerca negozi..."
                    className="input w-full pr-10"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    role="combobox"
                    aria-autocomplete="list"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  
                  {/* Suggerimenti negozi */}
                  {showStoreSuggestions && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
                    >
                      {storeSuggestions.length > 0 ? (
                        storeSuggestions.map((store, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStoreSelect(store);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors flex items-center gap-2"
                          >
                            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="truncate">{store}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          <span>Nessun negozio trovato</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Negozi selezionati */}
                {filters.selectedStores.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.selectedStores.map(store => (
                      <div
                        key={store}
                        className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg text-sm"
                      >
                        <span className="truncate">{store}</span>
                        <button
                          onClick={() => removeStore(store)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Azioni */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary flex-1 py-2"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1 py-2"
            >
              Applica Filtri
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterDialog; 