import { Trash2, TrendingUp, TrendingDown, AlertCircle, Edit, Store } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
              <TrendingDown className="w-10 h-10 text-muted-foreground" />
            ) : (
              <TrendingUp className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Nessuna {type === 'expense' ? 'spesa' : 'entrata'} registrata
          </h3>
          <p className="text-muted-foreground text-sm">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-xl">
                  {getCategoryIcon(item.category)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {item.store || 'Senza negozio'}
                    </h3>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className={`text-lg font-bold ${
                    type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {type === 'expense' ? '-' : '+'}€{item.amount.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {item.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg"
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