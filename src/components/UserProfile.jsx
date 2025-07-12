import { useState } from 'react';
import { User, Calendar, FileText, Trash2, X, LogOut } from 'lucide-react';
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

      {/* Conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Elimina Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sei sicuro di voler eliminare il tuo account? Questa azione eliminerà:
                <br />• Tutti i tuoi dati (spese, entrate, conti, categorie)
                <br />• Il tuo account di accesso
                <br /><br />
                <strong>Questa azione non può essere annullata.</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    'Elimina'
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