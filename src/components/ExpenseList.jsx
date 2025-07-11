import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function ExpenseList({ items, onDelete, type }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: it });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentari': 'bg-red-100 text-red-800',
      'Trasporti': 'bg-blue-100 text-blue-800',
      'Intrattenimento': 'bg-purple-100 text-purple-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Bollette': 'bg-orange-100 text-orange-800',
      'Salute': 'bg-green-100 text-green-800',
      'Educazione': 'bg-indigo-100 text-indigo-800',
      'Stipendio': 'bg-green-100 text-green-800',
      'Freelance': 'bg-blue-100 text-blue-800',
      'Investimenti': 'bg-yellow-100 text-yellow-800',
      'Regali': 'bg-pink-100 text-pink-800',
      'Vendite': 'bg-purple-100 text-purple-800',
      'Altro': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Altro'];
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          {type === 'expense' ? (
            <TrendingDown className="w-12 h-12 mx-auto" />
          ) : (
            <TrendingUp className="w-12 h-12 mx-auto" />
          )}
        </div>
        <p className="text-gray-500">
          Nessuna {type === 'expense' ? 'spesa' : 'entrata'} registrata
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Aggiungi la tua prima {type === 'expense' ? 'spesa' : 'entrata'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {item.description}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {formatDate(item.date)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {type === 'expense' ? '-' : '+'}€{item.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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