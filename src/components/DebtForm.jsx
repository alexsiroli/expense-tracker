import { useState, useEffect } from 'react';
import { X, User, Wallet, Euro, FileText, Calendar, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const DebtForm = ({ 
  onSubmit, 
  onClose, 
  editingItem = null, 
  wallets = [], 
  existingPersons = [],
  transactionType = 'debt' // 'debt' or 'credit'
}) => {
  const [formData, setFormData] = useState({
    personName: '',
    walletId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    type: transactionType
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        personName: editingItem.personName || '',
        walletId: editingItem.walletId || '',
        amount: editingItem.amount?.toString() || '',
        description: editingItem.description || '',
        date: editingItem.date || new Date().toISOString().split('T')[0],
        time: editingItem.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: editingItem.type || 'debt'
      });
    } else {
      // Nuovo movimento - non precompilare nulla
      setFormData({
        personName: '',
        walletId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: transactionType
      });
    }
  }, [editingItem, transactionType, wallets]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle person name suggestions
    if (field === 'personName') {
      const filtered = existingPersons.filter(person => 
        person.toLowerCase().includes((value || '').toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions((value || '').length > 0 && filtered.length > 0);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, personName: suggestion }));
    setShowSuggestions(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.personName.trim()) {
      newErrors.personName = 'Nome persona obbligatorio';
    }

    if (!formData.walletId) {
      newErrors.walletId = 'Conto obbligatorio';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Importo deve essere maggiore di zero';
    }

    if (!formData.date) {
      newErrors.date = 'Data obbligatoria';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.date = 'La data non può essere nel futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const debtData = {
      ...formData,
      amount: parseFloat(formData.amount),
      personName: formData.personName.trim()
    };

    onSubmit(debtData);
  };

  const getTitle = () => {
    if (editingItem) {
      return `Modifica ${editingItem.type === 'credit' ? 'Credito' : 'Debito'}`;
    }
    return transactionType === 'credit' ? 'Nuovo Credito' : 'Nuovo Debito';
  };

  const getSubmitText = () => {
    if (editingItem) return 'Salva Modifiche';
    return transactionType === 'credit' ? 'Aggiungi Credito' : 'Aggiungi Debito';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-3 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User className="w-4 h-4" />
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nome Persona */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Nome Persona
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => handleInputChange('personName', e.target.value)}
                className={`w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.personName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Inserisci il nome della persona"
              />
              <User className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" style={{ top: '12px' }} />
            </div>
            {errors.personName && (
              <p className="text-red-500 text-sm mt-1">{errors.personName}</p>
            )}
            
            {/* Suggestions */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conto */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Conto
            </label>
            <div className="relative">
              <select
                value={formData.walletId}
                onChange={(e) => handleInputChange('walletId', e.target.value)}
                className={`w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.walletId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleziona un conto</option>
                {wallets.map(wallet => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
              <Wallet className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" style={{ top: '12px' }} />
            </div>
            {errors.walletId && (
              <p className="text-red-500 text-sm mt-1">{errors.walletId}</p>
            )}
          </div>

          {/* Importo */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Importo
            </label>
            <div className="relative">
              <Euro className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" style={{ top: '12px' }} />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full p-2 pl-8 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0,00"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Descrizione (opzionale)
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                rows="2"
                placeholder="Aggiungi una descrizione..."
              />
              <FileText className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Data e Ora */}
                      <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Data
                </label>
              <div className="relative">
                <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" style={{ top: '12px' }} />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full p-2 pl-8 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Ora
              </label>
              <div className="relative">
                <Clock className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" style={{ top: '12px' }} />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Pulsanti */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 text-sm"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-blue-700/90 transition-all duration-200 transform hover:scale-105 text-sm"
            >
              {getSubmitText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtForm; 