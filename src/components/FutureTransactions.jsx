import { useState, useEffect } from 'react';
import { Clock, Calendar, Tag, Store, Wallet, Trash2, Edit } from 'lucide-react';
import { formatCurrency, getCurrentRomeTime } from '../utils/formatters';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { isFutureDate } from '../features/expenses/expenseLogic';

const FutureTransactions = ({ 
  expenses = [], 
  incomes = [], 
  wallets = [], 
  categories = [],
  onEdit,
  onDelete,
  onMoveToCurrent
}) => {
  const [futureTransactions, setFutureTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Filtra e combina le transazioni future (incluse quelle di oggi con orario futuro)
    const futureExpenses = expenses
      .filter(expense => isFutureDate(expense.date))
      .map(expense => ({ ...expense, _type: 'expense' }));
    
    const futureIncomes = incomes
      .filter(income => isFutureDate(income.date))
      .map(income => ({ ...income, _type: 'income' }));
    
    // Combina e ordina dalla più vicina alla più lontana
    const allFuture = [...futureExpenses, ...futureIncomes]
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setFutureTransactions(allFuture);
  }, [expenses, incomes]);

  const getWalletName = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Conto non trovato';
  };

  const getCategoryIcon = (categoryName, type) => {
    if (type === 'income') {
      const category = categories.income?.find(c => c.name === categoryName);
      return category?.icon || <Tag className="w-4 h-4" />;
    } else {
      const category = categories.expense?.find(c => c.name === categoryName);
      return category?.icon || <Tag className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = getCurrentRomeTime();
      
      // Se è oggi, mostra anche l'ora
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (transactionDate.getTime() === today.getTime()) {
        return format(date, 'EEEE dd MMMM yyyy - HH:mm', { locale: it });
      } else {
        return format(date, 'EEEE dd MMMM yyyy', { locale: it });
      }
    } catch (error) {
      return 'Data non valida';
    }
  };

  const getDaysUntil = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = getCurrentRomeTime();
      const diffTime = date.getTime() - now.getTime();
      
      // Se è oggi ma l'ora è nel futuro
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (transactionDate.getTime() === today.getTime()) {
        // È oggi: calcola ore e minuti
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
          return `Tra ${diffHours} ore${diffMinutes > 0 ? ` e ${diffMinutes} minuti` : ''}`;
        } else if (diffMinutes > 0) {
          return `Tra ${diffMinutes} minuti`;
        } else {
          return 'Ora';
        }
      }
      
      // Per date future
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Domani';
      if (diffDays === 2) return 'Dopodomani';
      if (diffDays < 7) return `Tra ${diffDays} giorni`;
      if (diffDays < 30) return `Tra ${Math.ceil(diffDays / 7)} settimane`;
      if (diffDays < 365) return `Tra ${Math.ceil(diffDays / 30)} mesi`;
      return `Tra ${Math.ceil(diffDays / 365)} anni`;
    } catch (error) {
      return 'Data non valida';
    }
  };

  const handleMoveToCurrent = async (transaction) => {
    try {
      setLoading(true);
      await onMoveToCurrent(transaction);
    } catch (error) {
      console.error('Errore durante lo spostamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (futureTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Nessuna transazione futura
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Non hai ancora creato transazioni per date future.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Transazioni Future ({futureTransactions.length})
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
        {futureTransactions.map((transaction) => (
          <div
            key={`${transaction._type}-${transaction.id}`}
            className={`card p-4 border-l-4 ${
              transaction._type === 'expense' 
                ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' 
                : 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      transaction._type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {getCategoryIcon(transaction.category, transaction._type)}
                    <span>{transaction.category}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Store className="w-4 h-4" />
                    <span>{transaction.store}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Wallet className="w-4 h-4" />
                    <span>{getWalletName(transaction.walletId)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                  
                  <div className="text-orange-600 dark:text-orange-400 font-medium">
                    {getDaysUntil(transaction.date)}
                  </div>
                </div>
                
                {transaction.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    "{transaction.note}"
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Modifica"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDelete(transaction)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleMoveToCurrent(transaction)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                <span>Sposta a oggi</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FutureTransactions;
