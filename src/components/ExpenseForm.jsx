import { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, Save, ArrowLeft, Store, Search } from 'lucide-react';

function ExpenseForm({ onSubmit, onClose, type, editingItem = null, stores = [], categories = [] }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: categories.length > 0 ? categories[0].name : '',
    date: new Date().toISOString().split('T')[0],
    store: ''
  });

  const [storeSuggestions, setStoreSuggestions] = useState([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);

  // Inizializza il form con i dati dell'item da modificare
  useEffect(() => {
    if (editingItem) {
      setFormData({
        description: editingItem.description || '',
        amount: editingItem.amount?.toString() || '',
        category: editingItem.category || (categories.length > 0 ? categories[0].name : ''),
        date: editingItem.date ? editingItem.date.split('T')[0] : new Date().toISOString().split('T')[0],
        store: editingItem.store || ''
      });
    }
  }, [editingItem, categories]);

  // Filtra i negozi mentre l'utente digita
  useEffect(() => {
    if (formData.store.trim()) {
      const filtered = stores.filter(store => 
        store.toLowerCase().includes(formData.store.toLowerCase())
      );
      setStoreSuggestions(filtered);
      setShowStoreSuggestions(filtered.length > 0);
    } else {
      setStoreSuggestions([]);
      setShowStoreSuggestions(false);
    }
  }, [formData.store, stores]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      store: formData.store.trim()
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreSelect = (store) => {
    setFormData(prev => ({ ...prev, store }));
    setShowStoreSuggestions(false);
  };

  const handleAmountFocus = (e) => {
    // Apre la tastiera numerica su mobile
    e.target.setAttribute('inputmode', 'decimal');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="gradient-bg text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">
              {editingItem ? 'Modifica' : 'Aggiungi'} {type === 'expense' ? 'Spesa' : 'Entrata'}
            </h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Descrizione (opzionale)
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={`Descrizione ${type === 'expense' ? 'spesa' : 'entrata'}`}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Importo (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onFocus={handleAmountFocus}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input pl-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Negozio
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                name="store"
                value={formData.store}
                onChange={handleChange}
                placeholder="Nome negozio"
                className="input pl-12"
              />
              
              {/* Suggerimenti negozi */}
              {showStoreSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {storeSuggestions.map((store, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleStoreSelect(store)}
                      className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                      {store}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Categoria
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input pl-12"
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
            <label className="block text-sm font-semibold text-foreground mb-3">
              Data
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input pl-12"
                required
              />
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