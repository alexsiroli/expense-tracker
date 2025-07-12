import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, Store, Search, Filter, Clock } from 'lucide-react';

function FilterDialog({ isOpen, onClose, onApplyFilters, categories = [], stores = [] }) {
  const [filters, setFilters] = useState({
    timeRange: 'all', // all, today, week, month, year, custom
    startDate: '',
    endDate: '',
    selectedCategories: [],
    selectedStores: [],
    searchStore: ''
  });

  const [storeSuggestions, setStoreSuggestions] = useState([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const storeSearchRef = useRef(null);
  const suggestionsRef = useRef(null);

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
      timeRange: 'all',
      startDate: '',
      endDate: '',
      selectedCategories: [],
      selectedStores: [],
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtri
            </h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filtro per tempo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Periodo
            </label>
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
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    filters.timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Date personalizzate */}
            {filters.timeRange === 'custom' && (
              <div className="mt-4 space-y-3">
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

          {/* Filtro per categorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Categorie
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.name)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    filters.selectedCategories.includes(category.name)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro per negozi */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Negozi
            </label>
            
            {/* Ricerca negozi */}
            <div className="relative mb-3">
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

          {/* Azioni */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary flex-1"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1"
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