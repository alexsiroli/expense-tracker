import React from 'react';
import { formatCurrency } from '../utils/formatters';

function TransactionDetailDialog({ transaction, onClose, onEdit, onDelete, categories }) {
  if (!transaction) return null;
  const cat = (categories.expense || []).concat(categories.income || []).find(c => c.name === transaction.category);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Dettagli transazione</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-2xl leading-none">
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cat?.icon || '📦'}</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{transaction.category}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.store || 'Senza negozio'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>{transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.date ? new Date(transaction.date).toLocaleString() : ''}</span>
          </div>
          {transaction.note && <div className="text-sm text-gray-700 dark:text-gray-300">{transaction.note}</div>}
        </div>
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onEdit} className="btn btn-secondary flex-1">Modifica</button>
          <button onClick={onDelete} className="btn btn-danger flex-1">Elimina</button>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailDialog; 