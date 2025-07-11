import { Trash2, TrendingUp, TrendingDown, AlertCircle, Edit, Store } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';

function ExpenseList({ items, onDelete, onEdit, type, categories = [] }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: it });
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || '📦';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            {type === 'expense' ? (
              <TrendingDown className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            ) : (
              <TrendingUp className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Nessuna {type === 'expense' ? 'spesa' : 'entrata'} registrata
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aggiungi la tua prima {type === 'expense' ? 'spesa' : 'entrata'} per iniziare
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((item) => (
          <div key={item.id} className="expense-item p-5">
            <div className="flex items-start gap-4">
              {/* Category Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm flex items-center justify-center text-xl">
                  {getCategoryIcon(item.category)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {item.store || 'Senza negozio'}
                    </h3>
                  </div>
                  <div className={`text-lg font-bold ${
                    type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600 border border-blue-600/20">
                      {item.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors rounded-lg"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-destructive transition-colors rounded-lg"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default ExpenseList; 