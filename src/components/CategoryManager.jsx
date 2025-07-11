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
        <h3 className="text-lg font-semibold text-foreground">
          Categorie {type === 'expense' ? 'Spese' : 'Entrate'}
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi
        </button>
      </div>

      {/* Lista categorie */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleEdit(category)}
            className="card p-4 flex items-center gap-3 min-w-0 w-full text-left hover:bg-secondary/40 transition-colors"
            aria-label={`Modifica categoria ${category.name}`}
          >
            <span className="text-2xl flex-shrink-0">{category.icon}</span>
            <span className="font-medium text-foreground truncate">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Form per aggiungere/modificare categoria */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="gradient-bg text-white p-6 rounded-t-3xl">
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
                <label className="block text-sm font-semibold text-foreground mb-3">
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
                <label className="block text-sm font-semibold text-foreground mb-3">
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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
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
                  className="btn btn-secondary flex-1"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingCategory ? 'Modifica' : 'Aggiungi'}
                </button>
              </div>

              {/* Pulsante elimina solo in modifica */}
              {editingCategory && (
                <div className="pt-6">
                  <button
                    type="button"
                    className="btn btn-danger w-full"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
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