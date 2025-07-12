import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import TransferModal from './TransferModal';
import { formatCurrency } from '../utils/formatters';

function WalletManager({ wallets, onAdd, onEdit, onDelete, onTransfer, onShowForm, onEditWallet }) {
  const [showTransferModal, setShowTransferModal] = useState(false);



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestione Conti</h3>
        <button
          onClick={onShowForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-blue-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Nuovo Conto</span>
        </button>
      </div>
      

      
      <div className="grid grid-cols-1 gap-3">
        {wallets.map(wallet => (
          <div key={wallet.id} className="card p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-4 h-4 rounded-full" style={{ background: wallet.color, display: 'inline-block' }}></span>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{wallet.name}</span>
              <span className={`text-xs font-medium ${wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(wallet.balance)}
              </span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEditWallet(wallet)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 transition-colors" aria-label="Modifica conto">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(wallet.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-destructive transition-colors" aria-label="Elimina conto">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottone Trasferimento */}
      {wallets.length > 1 && (
        <div className="mt-6">
          <button
            onClick={() => setShowTransferModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-purple-700/90 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">Trasferisci tra Conti</span>
          </button>
        </div>
      )}



      {/* Modal Trasferimento */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={onTransfer}
        wallets={wallets}
      />
    </div>
  );
}

export default WalletManager; 