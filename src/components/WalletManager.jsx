import { useState } from 'react';
import { Plus, ArrowRight, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

function WalletManager({ wallets, onAdd, onEdit, onDelete, onTransfer, onShowForm, onEditWallet, onShowTransferModal }) {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletActions, setShowWalletActions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletActions(true);
  };

  const handleEditWallet = () => {
    if (selectedWallet) {
      onEditWallet(selectedWallet);
      setShowWalletActions(false);
      setSelectedWallet(null);
    }
  };

  const handleDeleteWallet = () => {
    setShowWalletActions(false);
    setShowConfirmDelete(true);
  };

  const confirmDeleteWallet = async () => {
    if (selectedWallet) {
      setDeleting(true);
      try {
        await onDelete(selectedWallet.id);
      } catch (e) {}
      setDeleting(false);
      setShowConfirmDelete(false);
      setSelectedWallet(null);
    }
  };

  const closeWalletActions = () => {
    setShowWalletActions(false);
    setSelectedWallet(null);
  };

  const closeConfirmDelete = () => {
    setShowConfirmDelete(false);
    setSelectedWallet(null);
  };

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
            onClick={() => handleWalletClick(wallet)}
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
      {/* Modal Azioni Wallet */}
      {showWalletActions && selectedWallet && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs p-6 border border-gray-200 dark:border-gray-700 relative">
            <button onClick={closeWalletActions} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-2 mb-6">
              <span className="w-10 h-10 rounded-full" style={{ background: selectedWallet.color, display: 'inline-block' }}></span>
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedWallet.name}</div>
              <div className={`text-sm font-medium ${selectedWallet.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(selectedWallet.balance)}</div>
            </div>
            <button
              onClick={handleEditWallet}
              className="w-full flex items-center gap-2 justify-center py-3 mb-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
            >
              <Edit className="w-5 h-5" /> Modifica
            </button>
            <button
              onClick={handleDeleteWallet}
              className="w-full flex items-center gap-2 justify-center py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold"
            >
              <Trash2 className="w-5 h-5" /> Elimina
            </button>
          </div>
        </div>
      )}
      {/* Modal Conferma Eliminazione */}
      {showConfirmDelete && selectedWallet && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs p-6 border border-gray-200 dark:border-gray-700 relative">
            <button onClick={closeConfirmDelete} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 text-center">
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Conferma eliminazione</div>
              <div className="text-gray-600 dark:text-gray-300">Sei sicuro di voler eliminare il conto <span className='font-semibold'>{selectedWallet.name}</span>? Questa azione non può essere annullata.</div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={closeConfirmDelete}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
                disabled={deleting}
              >
                Annulla
              </button>
              <button
                onClick={confirmDeleteWallet}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold"
                disabled={deleting}
              >
                {deleting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletManager; 