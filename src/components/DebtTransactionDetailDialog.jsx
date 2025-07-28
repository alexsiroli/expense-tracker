import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { User, Calendar, Clock, FileText, Wallet, Euro, X, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function DebtTransactionDetailDialog({ transaction, onClose, onEdit, onDelete, wallets = [] }) {
  if (!transaction) return null;
  
  const wallet = wallets.find(w => w.id === transaction.walletId);
  
  // Formatta la data e ora
  const transactionDate = transaction.date ? new Date(transaction.date) : new Date();
  const formattedDate = transactionDate.toLocaleDateString('it-IT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = transaction.time || '00:00';

  const getTransactionIcon = (type) => {
    return type === 'credit' ? 
      <TrendingUp className="w-6 h-6 text-green-600" /> : 
      <TrendingDown className="w-6 h-6 text-red-600" />;
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionText = (type) => {
    return type === 'credit' ? 'Credito' : 'Debito';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-3 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">Dettagli Movimento</h2>
            <div className="w-5"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Importo principale */}
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${getTransactionColor(transaction.type)}`}>
              {formatCurrency(transaction.amount)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {getTransactionText(transaction.type)}
            </div>
          </div>

          {/* Tipo e icona */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {getTransactionIcon(transaction.type)}
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{getTransactionText(transaction.type)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tipo di movimento</div>
            </div>
          </div>

          {/* Persona */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{transaction.personName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Persona</div>
            </div>
          </div>

          {/* Conto */}
          {wallet && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div 
                className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                style={{ backgroundColor: wallet.color }}
              >
                <Wallet className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{wallet.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Conto</div>
              </div>
            </div>
          )}

          {/* Data */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{formattedDate}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Data</div>
            </div>
          </div>

          {/* Ora */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{formattedTime}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ora</div>
            </div>
          </div>

          {/* Descrizione */}
          {transaction.description && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{transaction.description}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Descrizione</div>
              </div>
            </div>
          )}

          {/* Azioni */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <TrendingUp className="w-3 h-3" />
              Modifica
            </button>
            <button
              onClick={() => {
                onDelete(transaction.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              <TrendingDown className="w-3 h-3" />
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebtTransactionDetailDialog; 