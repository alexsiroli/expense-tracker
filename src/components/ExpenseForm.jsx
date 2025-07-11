import { useState } from 'react';
import { X, DollarSign, Tag, Calendar, Save, ArrowLeft } from 'lucide-react';

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
              Aggiungi {type === 'expense' ? 'Spesa' : 'Entrata'}
            </h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
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
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Importo (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input pl-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Categoria
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input pl-12"
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
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Data
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
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
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm; 