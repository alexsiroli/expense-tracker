import { useState } from 'react';
import { User, Calendar, FileText, Trash2, X, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, logout, deleteAccount } = useAuth();
  const { deleteAllUserData } = useFirestore();
  const { data: expenses } = useFirestore().useCollectionData('expenses');
  const { data: incomes } = useFirestore().useCollectionData('incomes');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  if (!isOpen) return null;

  const totalTransactions = (expenses?.length || 0) + (incomes?.length || 0);
  const registrationDate = user?.metadata?.creationTime 
    ? format(new Date(user.metadata.creationTime), 'dd MMMM yyyy', { locale: it })
    : 'Data non disponibile';

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Prima elimina tutti i dati Firestore
      await deleteAllUserData();
      
      // Poi elimina l'account utente
      await deleteAccount();
      
      // Chiudi il modal
      onClose();
      
      console.log('Account eliminato con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione account:', error);
      
      // Se l'errore è dovuto a login recente richiesto, mostra messaggio specifico
      if (error.code === 'auth/requires-recent-login') {
        const confirmed = confirm(
          'Per eliminare l\'account, devi effettuare nuovamente l\'accesso per motivi di sicurezza.\n\n' +
          'Clicca OK per essere reindirizzato alla pagina di login, dove potrai:\n' +
          '1. Effettuare nuovamente l\'accesso\n' +
          '2. Tornare qui e riprovare a eliminare l\'account\n\n' +
          'Vuoi procedere?'
        );
        
        if (confirmed) {
          await logout();
          onClose();
        }
      } else {
        alert(`Errore durante l'eliminazione account: ${error.message}`);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Profilo Utente
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar e nome */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {(() => {
                  const name = user?.displayName || user?.email;
                  const words = name?.split(' ').filter(word => word.length > 0) || [];
                  if (words.length >= 2) {
                    return (words[0][0] + words[1][0]).toUpperCase();
                  } else if (words.length === 1) {
                    return words[0].substring(0, 2).toUpperCase();
                  } else {
                    return name?.substring(0, 2).toUpperCase() || 'U';
                  }
                })()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user?.displayName || 'Utente'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Transazioni
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalTransactions}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Registrato
                </span>
              </div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {registrationDate}
              </p>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Sviluppato con ❤️
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Questa web app è stata realizzata da
              </p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                Alex Siroli
              </p>
            </div>
          </div>

          {/* Azioni */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Elimina Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conferma eliminazione aggressiva */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
            {/* Header rosso */}
            <div className="bg-red-600/90 backdrop-blur-sm text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Elimina Account
                </h2>
                <div className="w-6"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ATTENZIONE!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Stai per eliminare <strong>DEFINITIVAMENTE</strong> il tuo account:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-6">
                  <li>• Tutti i tuoi dati personali</li>
                  <li>• Tutte le spese e entrate</li>
                  <li>• Tutte le categorie personalizzate</li>
                  <li>• Tutti i negozi salvati</li>
                  <li>• Tutti i conti e saldi</li>
                  <li>• Il tuo account di accesso</li>
                  <li>• Tutte le impostazioni</li>
                </ul>
                <p className="text-red-600 font-semibold">
                  Questa azione è <strong>IRREVERSIBILE</strong> e non può essere annullata!
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Per confermare, scrivi <strong>ELIMINA</strong>:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Scrivi ELIMINA per continuare"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmation === 'ELIMINA') {
                      handleDeleteAccount();
                    }
                  }}
                  disabled={deleteConfirmation !== 'ELIMINA' || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Elimina Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 