import { useState } from 'react';
import { Plus, ArrowRight, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

function WalletManager({ wallets, onAdd, onEdit, onDelete, onTransfer, onShowForm, onEditWallet, onShowTransferModal, onWalletClick }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestione Conti</h3>
        <button
          onClick={onShowForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-blue-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Nuovo</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {wallets.map(wallet => (
          <div
            key={wallet.id}
            className="card p-4 flex items-center justify-between gap-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => onWalletClick(wallet)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-4 h-4 rounded-full" style={{ background: wallet.color, display: 'inline-block' }}></span>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{wallet.name}</span>
            </div>
            <div className={`ml-2 flex-shrink-0 px-3 py-1 rounded-xl border font-bold text-base ${wallet.balance >= 0 ? 'text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-700 dark:bg-green-900/30' : 'text-red-700 border-red-200 bg-red-50 dark:text-red-300 dark:border-red-700 dark:bg-red-900/30'}`}
                 style={{ textAlign: 'right' }}>
              {formatCurrency(wallet.balance)}
            </div>
          </div>
        ))}
      </div>
      {/* Bottone Trasferimento */}
      {wallets.length > 1 && (
        <div className="mt-6">
          <button
            onClick={onShowTransferModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-purple-700/90 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">Trasferisci tra Conti</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletManager; 