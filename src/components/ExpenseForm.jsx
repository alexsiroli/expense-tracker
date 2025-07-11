import { useState } from 'react';
import { X, DollarSign, Tag, Calendar } from 'lucide-react';

const categories = {
  expense: [
    'Alimentari',
    'Trasporti',
    'Intrattenimento',
    'Shopping',
    'Bollette',
    'Salute',
    'Educazione',
    'Altro'
  ],
  income: [
    'Stipendio',
    'Freelance',
    'Investimenti',
    'Regali',
    'Vendite',
    'Altro'
  ]
};

function ExpenseForm({ onSubmit, onClose, type }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: categories[type][0],
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Aggiungi {type === 'expense' ? 'Spesa' : 'Entrata'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={`Descrizione ${type === 'expense' ? 'spesa' : 'entrata'}`}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importo (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input pl-10"
              >
                {categories[type].map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm; 