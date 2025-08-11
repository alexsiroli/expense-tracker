import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { Wallet, Calendar, Clock, Store, Tag, Euro, MapPin, X } from 'lucide-react';

function TransactionDetailDialog({ transaction, onClose, onEdit, onDelete, categories, wallets = [] }) {
  if (!transaction) return null;
  
  const cat = (categories.expense || []).concat(categories.income || []).find(c => c.name === transaction.category);
  const wallet = wallets.find(w => w.id === transaction.walletId);
  
  // Determina se è spesa o entrata
  const isExpense = transaction._type === 'expense' || (transaction._type == null && (categories.expense || []).some(c => c.name === transaction.category));
  const isIncome = transaction._type === 'income' || (transaction._type == null && (categories.income || []).some(c => c.name === transaction.category));
  
  // Formatta la data e ora
  const transactionDate = transaction.date ? new Date(transaction.date) : new Date();
  const formattedDate = transactionDate.toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = transactionDate.toLocaleTimeString('it-IT', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Dettagli Transazione</h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Importo principale */}
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
              {isExpense ? '-' : isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isExpense ? 'Spesa' : isIncome ? 'Entrata' : 'Transazione'}
            </div>
          </div>

          {/* Categoria e icona */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <span className="text-3xl">{cat?.icon || '📦'}</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100">{transaction.category}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Categoria</div>
            </div>
          </div>

          {/* Conto */}
          {wallet && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                style={{ backgroundColor: wallet.color }}
              >
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">{wallet.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Conto</div>
              </div>
            </div>
          )}

          {/* Negozio */}
          {transaction.store && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Store className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{transaction.store}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Negozio</div>
              </div>
            </div>
          )}

          {/* Data e ora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{formattedDate}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Data</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{formattedTime}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Ora</div>
              </div>
            </div>
          </div>

          {/* Note */}
          {transaction.note && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Note</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{transaction.note}</div>
            </div>
          )}


        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onEdit} className="btn btn-secondary flex-1">
            Modifica
          </button>
          <button onClick={onDelete} className="btn btn-danger flex-1">
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailDialog; 