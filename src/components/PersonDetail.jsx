import { useState } from 'react';
import { X, User, Euro, Calendar, FileText, Wallet, TrendingUp, TrendingDown, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { calculatePersonBalance } from '../features/debts/debtLogic';
import DebtTransactionItem from './DebtTransactionItem';

const PersonDetail = ({ 
  person, 
  debts = [], 
  wallets = [],
  onClose, 
  onEditDebt,
  onDeleteDebt,
  onShowDebtTransactionDetail,
  onResolveSituation,
  onDeletePerson
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const personTransactions = debts.filter(d => d.personName === person.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const balance = calculatePersonBalance(debts, person.name);
  
  const getBalanceColor = (balance) => {
    if (balance > 0) {
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40';
    } else if (balance < 0) {
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40';
    }
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/40';
  };

  const getBalanceIcon = (balance) => {
    if (balance > 0) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (balance < 0) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Euro className="w-4 h-4" />;
  };

  const getBalanceText = (balance) => {
    if (balance > 0) {
      return `Credito: ${formatCurrency(balance)}`;
    } else if (balance < 0) {
      return `Debito: ${formatCurrency(Math.abs(balance))}`;
    }
    return 'Saldo azzerato';
  };



  const getWalletName = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Conto non trovato';
  };

  const handleResolveSituation = () => {
    if (balance === 0) {
      alert('Il saldo è già azzerato!');
      return;
    }
    onResolveSituation(person.name, balance);
  };

  const handleDeletePerson = () => {
    if (balance !== 0) {
      // Mostra messaggio di errore solo quando si tenta di eliminare
      alert('Impossibile eliminare una persona con la quale hai ancora un debito o un credito.');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDeletePerson = () => {
    onDeletePerson(person.name);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full animate-fade-in-up max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" />
              {person.name}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Saldo attuale */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  Saldo Attuale
                </h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm ${getBalanceColor(balance)}`}>
                  {getBalanceIcon(balance)}
                  <span>{getBalanceText(balance)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {personTransactions.length} {personTransactions.length === 1 ? 'movimento' : 'movimenti'}
                </p>
              </div>
            </div>
          </div>

          {/* Lista movimenti */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Movimenti
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {personTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nessun movimento trovato
                </div>
              ) : (
                personTransactions.map((transaction) => (
                  <DebtTransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onShowDetail={onShowDebtTransactionDetail}
                    onDelete={onDeleteDebt}
                    onEdit={onEditDebt}
                    getWalletName={getWalletName}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer con pulsanti */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            onClick={handleResolveSituation}
            disabled={balance === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Risolvi Situazione
          </button>
          
          <button
            onClick={handleDeletePerson}
            disabled={balance !== 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Elimina Persona
          </button>
        </div>
      </div>

      {/* Conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
            <div className="p-6 space-y-4">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Elimina Persona
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Sei sicuro di voler eliminare tutti i movimenti di <strong>{person.name}</strong>?
                  Questa azione non può essere annullata.
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeletePerson}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonDetail; 