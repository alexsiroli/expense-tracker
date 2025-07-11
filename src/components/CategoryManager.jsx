import { useState } from 'react';
import { Plus, X, Tag, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

function CategoryManager({ categories, onAddCategory, onDeleteCategory, onEditCategory, type }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '📦' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const icons = [
    '🍽️', '🚗', '🎮', '🛍️', '💡', '🏥', '📚', '💼',
    '💻', '📈', '🎁', '🛒', '🏠', '✈️', '🍔', '🍕',
    '🍣', '🍦', '🐶', '🐱', '⚽', '🏀', '🎸', '🎤'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      onEditCategory(editingCategory.id, formData.name, formData.icon);
      setEditingCategory(null);
    } else {
      onAddCategory(formData.name, formData.icon, type);
    }
    
    setFormData({ name: '', icon: '📦' });
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', icon: '📦' });
  };

  const handleDelete = () => {
    if (editingCategory) {
      onDeleteCategory(editingCategory.id);
      setShowDeleteConfirm(false);
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', icon: '📦' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Categorie {type === 'expense' ? 'Spese' : 'Entrate'}
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-purple-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Aggiungi Categoria</span>
        </button>
      </div>

      {/* Lista categorie */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleEdit(category)}
            className="card p-4 flex items-center gap-3 min-w-0 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
            aria-label={`Modifica categoria ${category.name}`}
          >
            <span className="text-2xl flex-shrink-0">{category.icon}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Form per aggiungere/modificare categoria */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="bg-purple-600/90 backdrop-blur-sm text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleCancel}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">
                  {editingCategory ? 'Modifica' : 'Aggiungi'} Categoria
                </h2>
                <div className="w-6"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Nome Categoria
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome categoria"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Icona
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 rounded-lg text-2xl transition-all ${
                        formData.icon === icon
                          ? 'bg-blue-600 text-white'
                          : 'bg-secondary hover:bg-gray-100 dark:hover:bg-gray-700/80'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-purple-700/90 transition-all duration-200 transform hover:scale-105"
                >
                  {editingCategory ? 'Modifica' : 'Aggiungi'}
                </button>
              </div>

              {/* Pulsante elimina solo in modifica */}
              {editingCategory && (
                <div className="pt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina categoria
                  </button>
                </div>
              )}
            </form>
          </div>
          {/* Dialog conferma eliminazione */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Conferma eliminazione"
            message="Sei sicuro di voler eliminare questa categoria? Questa azione non può essere annullata."
          />
        </div>
      )}
    </div>
  );
}

export default CategoryManager; 