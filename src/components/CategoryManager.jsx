import { useState } from 'react';
import { Plus, X, Tag, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

function CategoryManager({ categories, onAddCategory, onDeleteCategory, onEditCategory, type, onShowForm, onCategoryClick }) {

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Categorie {type === 'expense' ? 'Spese' : 'Entrate'}
        </h3>
        <button
          onClick={() => onShowForm(type)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-purple-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Nuovo</span>
        </button>
      </div>

      {/* Lista categorie */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryClick(category, type)}
            className="card p-4 flex items-center gap-3 min-w-0 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
            aria-label={`Modifica categoria ${category.name}`}
          >
            <span className="text-2xl flex-shrink-0">{category.icon}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{category.name}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

export default CategoryManager; 