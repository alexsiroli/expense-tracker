import { useState, useEffect, useRef } from 'react';
import { X, Euro, Tag, Calendar, Save, ArrowLeft, Store, Search, Wallet } from 'lucide-react';

function ExpenseForm({ onSubmit, onClose, type, editingItem = null, stores = [], categories = [], wallets = [], selectedWalletId, onAddStore }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: categories.length > 0 ? categories[0].name : '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    store: '',
    walletId: selectedWalletId || (wallets[0]?.id ?? '')
  });

  const [storeSuggestions, setStoreSuggestions] = useState([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const storeInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Inizializza il form con i dati dell'item da modificare
  useEffect(() => {
    if (editingItem) {
      const itemDate = editingItem.date ? new Date(editingItem.date) : new Date();
      setFormData({
        amount: editingItem.amount?.toString() || '',
        category: editingItem.category || (categories.length > 0 ? categories[0].name : ''),
        date: itemDate.toISOString().split('T')[0],
        time: itemDate.toTimeString().slice(0, 5),
        store: editingItem.store || '',
        walletId: editingItem.walletId || selectedWalletId || (wallets[0]?.id ?? '')
      });
    }
  }, [editingItem, categories, wallets, selectedWalletId]);

  // Gestisce il click fuori dai suggerimenti per chiuderli
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          storeInputRef.current && !storeInputRef.current.contains(event.target)) {
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

  // Disabilita l'autocompletamento del browser all'inizializzazione
  useEffect(() => {
    if (storeInputRef.current) {
      storeInputRef.current.setAttribute('autocomplete', 'off');
      storeInputRef.current.setAttribute('data-autocomplete', 'off');
    }
  }, []);

  // Filtra i negozi mentre l'utente digita
  useEffect(() => {
    // Mostra tutti i negozi disponibili quando l'input è vuoto e ha focus
    if (!formData.store.trim() && storeInputRef.current === document.activeElement) {
      setStoreSuggestions(stores.slice(0, 5)); // Mostra solo i primi 5
      setShowStoreSuggestions(stores.length > 0);
    } else if (!formData.store.trim()) {
      // Nascondi suggerimenti quando l'input è vuoto e non ha focus
      setStoreSuggestions([]);
      setShowStoreSuggestions(false);
    }
  }, [formData.store, stores]);

  // Aggiunge il negozio alla lista se non esiste
  const addStoreToSuggestions = async (storeName) => {
    if (storeName.trim() && !stores.includes(storeName.trim()) && onAddStore) {
      await onAddStore(storeName.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    // Aggiunge il negozio alla lista se non esiste
    await addStoreToSuggestions(formData.store);
    
    // Combina data e ora per creare un timestamp completo
    const dateTime = `${formData.date}T${formData.time}:00`;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      store: formData.store.trim(),
      date: dateTime
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mostra suggerimenti per i negozi mentre l'utente digita
    if (name === 'store' && value.trim()) {
      const filtered = stores.filter(store => 
        store.toLowerCase().includes(value.toLowerCase())
      );
      
      // Ordina: prima quelli che iniziano con il testo, poi quelli che lo contengono, tutto in ordine alfabetico
      const sorted = filtered.sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(value.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(value.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b, 'it', { sensitivity: 'base' });
      });
      
      setStoreSuggestions(sorted);
      setShowStoreSuggestions(true);
    } else if (name === 'store' && !value.trim()) {
      setStoreSuggestions([]);
      setShowStoreSuggestions(false);
    }
  };

  const handleStoreSelect = (store) => {
    setFormData(prev => ({ ...prev, store }));
    setShowStoreSuggestions(false);
    // Focus back to input after selection
    setTimeout(() => {
      if (storeInputRef.current) {
        storeInputRef.current.focus();
      }
    }, 100);
  };

  const handleStoreInputFocus = () => {
    // Disabilita completamente l'autocompletamento del browser
    if (storeInputRef.current) {
      storeInputRef.current.setAttribute('autocomplete', 'off');
      storeInputRef.current.setAttribute('data-autocomplete', 'off');
    }
    
    // Mostra tutti i negozi disponibili quando l'input è vuoto
    if (!formData.store.trim()) {
      const sortedStores = [...stores].sort((a, b) => 
        a.localeCompare(b, 'it', { sensitivity: 'base' })
      );
      setStoreSuggestions(sortedStores.slice(0, 5));
      setShowStoreSuggestions(stores.length > 0);
    } else {
      // Filtra i negozi che contengono il testo digitato
      const filtered = stores.filter(store => 
        store.toLowerCase().includes(formData.store.toLowerCase())
      );
      
      // Ordina: prima quelli che iniziano con il testo, poi quelli che lo contengono, tutto in ordine alfabetico
      const sorted = filtered.sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(formData.store.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(formData.store.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b, 'it', { sensitivity: 'base' });
      });
      
      setStoreSuggestions(sorted);
      setShowStoreSuggestions(true);
    }
  };

  const handleStoreInputBlur = () => {
    // Delay hiding suggestions to allow for touch events
    setTimeout(() => {
      setShowStoreSuggestions(false);
    }, 300);
  };

  const handleStoreInputKeyDown = (e) => {
    if (e.key === 'Enter' && storeSuggestions.length > 0) {
      e.preventDefault();
      handleStoreSelect(storeSuggestions[0]);
    } else if (e.key === 'Escape') {
      setShowStoreSuggestions(false);
    }
  };

  const handleAmountFocus = (e) => {
    // Apre la tastiera numerica su mobile
    e.target.setAttribute('inputmode', 'decimal');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">
              {editingItem ? 'Modifica' : 'Nuovo'} {type === 'expense' ? 'Spesa' : 'Entrata'}
            </h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selettore conto */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Conto
            </label>
            <div>
              <div className="relative">
                <select
                  name="walletId"
                  value={formData.walletId}
                  onChange={handleChange}
                  className="input pr-10"
                  required
                >
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ 
                      backgroundColor: wallets.find(w => w.id === formData.walletId)?.color || '#6366f1'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Importo (Euro)
            </label>
            <div className="form-input-group">
              <Euro className="form-input-icon" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onFocus={handleAmountFocus}
                placeholder="0,00"
                step="0.01"
                className="input form-input-with-icon"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Negozio
            </label>
            <div className="form-input-group relative">
              <Store className="form-input-icon" />
              <input
                ref={storeInputRef}
                type="text"
                name="store"
                value={formData.store}
                onChange={handleChange}
                onFocus={handleStoreInputFocus}
                onBlur={handleStoreInputBlur}
                onKeyDown={handleStoreInputKeyDown}
                placeholder="Nome negozio"
                className="input form-input-with-icon"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="text"
                data-lpignore="true"
                data-form-type="other"
                data-autocomplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showStoreSuggestions}
                aria-haspopup="listbox"
              />
              
              {/* Suggerimenti negozi */}
              {showStoreSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto autocomplete-suggestions"
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
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="autocomplete-item w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors flex items-center gap-2"
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Categoria
              </label>
              <div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Data
              </label>
              <div>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Ora
              </label>
              <div>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`btn flex-1 ${type === 'expense' ? 'btn-danger' : 'btn-success'}`}
            >
              <Save className="w-5 h-5 mr-2" />
              {editingItem ? 'Modifica' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm; 