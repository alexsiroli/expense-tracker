import { useState } from 'react';
import { Plus, X, Edit, Trash2, ArrowRight } from 'lucide-react';
import TransferModal from './TransferModal';
import { formatCurrency } from '../utils/formatters';

const COLORS = [
  '#6366f1', '#f59e42', '#10b981', '#ef4444', '#3b82f6', '#f43f5e', '#eab308', '#a21caf', '#0ea5e9', '#f97316',
];

function WalletManager({ wallets, onAdd, onEdit, onDelete, onTransfer }) {
  const [showForm, setShowForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0], balance: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingWallet) {
      onEdit({ ...editingWallet, ...formData });
      setEditingWallet(null);
    } else {
      onAdd({ ...formData });
    }
    setFormData({ name: '', color: COLORS[0], balance: 0 });
    setShowForm(false);
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    // Usa il saldo iniziale se disponibile, altrimenti il saldo corrente
    const balanceToShow = wallet.initialBalance !== undefined ? wallet.initialBalance : wallet.balance;
    setFormData({ name: wallet.name, color: wallet.color, balance: balanceToShow });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWallet(null);
    setFormData({ name: '', color: COLORS[0], balance: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestione Conti</h3>
        <button
          onClick={() => setShowForm(true)}
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
              <button onClick={() => handleEdit(wallet)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 transition-colors" aria-label="Modifica conto">
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

      {/* Modal Aggiungi/Modifica Conto */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <button onClick={handleCancel} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{editingWallet ? 'Modifica' : 'Aggiungi'} Conto</h2>
                <div className="w-6"></div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Nome</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome conto" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Colore</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-primary scale-110' : 'border-transparent'} transition-all`} style={{ background: color }}></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Saldo iniziale</label>
                <input type="number" value={formData.balance} onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} className="input" step="0.01" required placeholder="0,00" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCancel} className="btn btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1">{editingWallet ? 'Modifica' : 'Aggiungi'}</button>
              </div>
            </form>
          </div>
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