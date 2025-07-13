import { Trash2, TrendingUp, TrendingDown, AlertCircle, Edit, Store } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';

function ExpenseList({ items, onDelete, onEdit, type, categories = [], onShowDetail, flameMode = false, angelicMode = false, timeTravelMode = false }) {
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

  // Raggruppa le transazioni per data
  const groupedItems = items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((groups, item) => {
      const date = item.date.split('T')[0]; // Prendi solo la data senza l'ora
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});

  // Ordina le transazioni all'interno di ogni gruppo per ora (più recenti prima)
  Object.keys(groupedItems).forEach(date => {
    groupedItems[date].sort((a, b) => {
      const timeA = a.date.includes('T') ? a.date.split('T')[1] : '00:00:00';
      const timeB = b.date.includes('T') ? b.date.split('T')[1] : '00:00:00';
      return timeB.localeCompare(timeA); // Ordina per ora decrescente (più recenti prima)
    });
  });

  const formatDateHeader = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateString === today) {
      return 'Oggi';
    } else if (dateString === yesterday) {
      return 'Ieri';
    } else {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy', { locale: it });
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date} className="space-y-3">
          {/* Header della data */}
          <div className="sticky top-40 z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {formatDateHeader(date)}
            </h3>
          </div>
          
          {/* Transazioni del giorno */}
          <div className="space-y-3">
            {dateItems.map((item) => (
              <div
                key={item.id}
                className={`expense-item p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  flameMode && item.amount === 666 ? 'animate-flame' : ''
                } ${
                  angelicMode && type === 'income' && parseFloat(item.amount) === 888 ? 'animate-angelic' : ''
                } ${
                  timeTravelMode && new Date(item.date).getFullYear() === 1999 && 
                  new Date(item.date).getMonth() === 11 && 
                  new Date(item.date).getDate() === 31 ? 'animate-glitch' : ''
                }`}
                onClick={() => onShowDetail && onShowDetail(item)}
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm flex items-center justify-center text-lg mt-3">
                      {getCategoryIcon(item.category)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-base">
                          {item.store || 'Senza negozio'}
                        </h3>
                      </div>
                      <div className={`text-xl font-bold flex items-center mt-3 ${
                        type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 -mt-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600 border border-blue-600/20">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(item.date), 'HH:mm', { locale: it })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList; 