import { useState } from 'react';
import { X, ArrowRight, Euro, Wallet } from 'lucide-react';

function TransferModal({ isOpen, onClose, onTransfer, wallets }) {
  const [formData, setFormData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fromWalletId || !formData.toWalletId || !formData.amount || formData.fromWalletId === formData.toWalletId) {
      return;
    }
    
    onTransfer(formData);
    setFormData({ fromWalletId: '', toWalletId: '', amount: '' });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Trasferimento tra Conti</h2>
            <div className="w-6"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conto di origine */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Conto di origine
            </label>
            <select
              name="fromWalletId"
              value={formData.fromWalletId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Seleziona conto di origine</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} (€{wallet.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Freccia */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Conto di destinazione */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Conto di destinazione
            </label>
            <select
              name="toWalletId"
              value={formData.toWalletId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Seleziona conto di destinazione</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} (€{wallet.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Importo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Euro className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Importo
            </label>
            <div className="form-input-group">
              <Euro className="form-input-icon" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                className="input form-input-with-icon"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!formData.fromWalletId || !formData.toWalletId || !formData.amount || formData.fromWalletId === formData.toWalletId}
              className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trasferisci
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferModal; 