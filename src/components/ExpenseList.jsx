import { Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function ExpenseList({ items, onDelete, type }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: it });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentari': 'bg-red-100 text-red-800 border-red-200',
      'Trasporti': 'bg-blue-100 text-blue-800 border-blue-200',
      'Intrattenimento': 'bg-purple-100 text-purple-800 border-purple-200',
      'Shopping': 'bg-pink-100 text-pink-800 border-pink-200',
      'Bollette': 'bg-orange-100 text-orange-800 border-orange-200',
      'Salute': 'bg-green-100 text-green-800 border-green-200',
      'Educazione': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Stipendio': 'bg-green-100 text-green-800 border-green-200',
      'Freelance': 'bg-blue-100 text-blue-800 border-blue-200',
      'Investimenti': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Regali': 'bg-pink-100 text-pink-800 border-pink-200',
      'Vendite': 'bg-purple-100 text-purple-800 border-purple-200',
      'Altro': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[category] || colors['Altro'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Alimentari': '🍽️',
      'Trasporti': '🚗',
      'Intrattenimento': '🎮',
      'Shopping': '🛍️',
      'Bollette': '💡',
      'Salute': '🏥',
      'Educazione': '📚',
      'Stipendio': '💼',
      'Freelance': '💻',
      'Investimenti': '📈',
      'Regali': '🎁',
      'Vendite': '🛒',
      'Altro': '📦'
    };
    return icons[category] || icons['Altro'];
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            {type === 'expense' ? (
              <TrendingDown className="w-10 h-10 text-slate-400" />
            ) : (
              <TrendingUp className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            Nessuna {type === 'expense' ? 'spesa' : 'entrata'} registrata
          </h3>
          <p className="text-slate-400 text-sm">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl">
                  {getCategoryIcon(item.category)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {item.description}
                  </h3>
                  <div className={`text-lg font-bold ${
                    type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {type === 'expense' ? '-' : '+'}€{item.amount.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default ExpenseList; 