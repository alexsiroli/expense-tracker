import { useState, useEffect } from 'react';
import { X, LogOut, Trash2, FileText, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { getAllEasterEggs, getEasterEggsWithCompletionStatus, saveEasterEggCompletion } from '../utils/easterEggs';

const UserProfile = ({ isOpen, onClose, easterEggsWithStatus }) => {
  const { user, logout, deleteAccount } = useAuth();
  const { deleteAllUserData, getCompletedEasterEggs, setEasterEggCompleted, isEasterEggCompleted } = useFirestore();
  const { data: expenses } = useFirestore().useCollectionData('expenses');
  const { data: incomes } = useFirestore().useCollectionData('incomes');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showEasterEggs, setShowEasterEggs] = useState(false);
  const [creditsTapCount, setCreditsTapCount] = useState(0);
  const [lastCreditsTapTime, setLastCreditsTapTime] = useState(0);

  // Rimuovi:
  // const loadEasterEggsWithStatus = async () => {
  //   try {
  //     const eggsWithStatus = await getEasterEggsWithCompletionStatus(getCompletedEasterEggs);
  //     setEasterEggsWithStatus(eggsWithStatus);
  //   } catch (error) {
  //     setEasterEggsWithStatus(getAllEasterEggs().map(egg => ({ ...egg, isCompleted: false })));
  //   }
  // };

  // Rimuovi:
  // useEffect(() => {
  //   if (user) loadEasterEggsWithStatus();
  //   window.loadEasterEggsWithStatus = loadEasterEggsWithStatus;
  //   return () => { delete window.loadEasterEggsWithStatus; };
  // }, [user, getCompletedEasterEggs]);

  if (!isOpen) return null;

  const totalTransactions = (expenses?.length || 0) + (incomes?.length || 0);
  const registrationDate = user?.metadata?.creationTime 
    ? format(new Date(user.metadata.creationTime), 'dd MMMM yyyy', { locale: it })
    : 'Data non disponibile';

  // Gestione easter egg - Tap segreto sui crediti
  const handleCreditsTap = () => {
    const now = Date.now();
    const timeDiff = now - lastCreditsTapTime;
    
    // Reset se è passato troppo tempo (> 3 secondi)
    if (timeDiff > 3000) {
      setCreditsTapCount(1);
    } else {
      setCreditsTapCount(prev => prev + 1);
    }
    
    setLastCreditsTapTime(now);
    
    // Se abbiamo raggiunto 8 tap rapidi
    if (creditsTapCount >= 7) { // 7 perché questo è l'8° tap
      setShowEasterEggs(true);
      setCreditsTapCount(0);
    }
  };

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
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full animate-fade-in-up">
        {/* Header */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Profilo Utente
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
          <div 
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95"
            onClick={handleCreditsTap}
            title="Tap 8 volte rapidamente per un easter egg! 🎉"
          >
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

      {/* Easter Egg Modal (Medagliere) */}
      {showEasterEggs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full animate-fade-in-up">
            {/* Header con X di chiusura */}
            <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-xl font-bold">Easter Egg</h2>
              <button
                onClick={() => setShowEasterEggs(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Colleziona tutte le medaglie nascoste!
                </p>
              </div>

              {/* Griglia distintivi stile medaglie Pokémon */}
              <div className="grid grid-cols-3 gap-4">
                {easterEggsWithStatus.map((egg, index) => {
                  const badgeColors = [
                    'from-red-500 to-pink-500', // Rosso
                    'from-blue-500 to-cyan-500', // Blu
                    'from-green-500 to-emerald-500', // Verde
                    'from-yellow-500 to-orange-500', // Giallo
                    'from-purple-500 to-indigo-500', // Viola
                    'from-teal-500 to-blue-500' // Turchese
                  ];
                  
                  const badgeIcons = ['🌈', '🎉', '🎮', '📺', '👼', '⏰'];
                  
                  return (
                    <button
                      key={egg.id}
                                              onClick={() => {
                          if (egg.isCompleted) {
                            // Se completato, mostra titolo e descrizione
                            alert(`${egg.title}\n\n${egg.description}`);
                          } else {
                            // Se non completato, mostra solo il titolo
                            alert(`${egg.title}\n\n???`);
                          }
                        }}
                      className="group relative"
                    >
                                              <div className={`
                          w-16 h-16 mx-auto rounded-full 
                          ${egg.isCompleted 
                            ? `bg-gradient-to-br ${badgeColors[index]} shadow-lg` 
                            : 'bg-gray-300 dark:bg-gray-600 shadow-md'
                          }
                          border-4 border-white dark:border-gray-700
                          flex items-center justify-center text-2xl
                          transform transition-all duration-300
                          hover:scale-110 hover:shadow-xl
                          active:scale-95
                          group-hover:animate-pulse
                        `}>
                          {egg.isCompleted ? badgeIcons[index] : '❓'}
                        </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tocca una medaglia per scoprire il suo segreto! 🔍
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      </div>
    );
  };

  export default UserProfile; 