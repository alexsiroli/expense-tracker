import { useState } from 'react';
import { Download, Upload, Database, AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react';

function DataManager({ onImportData, onResetData, onShowImportModal, onShowResetModal, onSanitizeStores }) {

  // Funzione per esportare tutti i dati
  const exportData = () => {
    const data = {
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      incomes: JSON.parse(localStorage.getItem('incomes') || '[]'),
      categories: JSON.parse(localStorage.getItem('categories') || '{}'),
      stores: JSON.parse(localStorage.getItem('stores') || '[]'),
      wallets: JSON.parse(localStorage.getItem('wallets') || '[]'),
      theme: localStorage.getItem('theme') || 'light',
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Funzione per gestire il caricamento del file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
      setImportError('');
    } else {
      setImportError('Seleziona un file JSON valido');
      setImportFile(null);
    }
  };

  // Funzione per importare i dati
  const importData = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validazione dei dati
        if (!data.expenses || !data.incomes || !data.categories || !data.stores || !data.wallets) {
          throw new Error('Formato file non valido');
        }

        // Importa i dati
        onImportData(data);
        setImportSuccess(true);
        setImportFile(null);
        
        // Reset dopo 3 secondi
        setTimeout(() => {
          setShowImportModal(false);
          setImportSuccess(false);
        }, 3000);

      } catch (error) {
        setImportError('Errore durante l\'importazione: ' + error.message);
      }
    };
    reader.readAsText(importFile);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Esporta Dati</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Scarica tutti i tuoi dati in un file JSON. Puoi usare questo file per fare backup o trasferire i dati su un altro dispositivo.
          </p>
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-blue-700/90 transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Scarica Backup</span>
          </button>
        </div>

        {/* Import */}
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Importa Dati</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Carica un file di backup per ripristinare tutti i tuoi dati. I dati esistenti verranno sostituiti.
          </p>
                  <button
          onClick={onShowImportModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-green-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Upload className="w-4 h-4" />
          <span className="font-medium">Importa Dati</span>
        </button>
        </div>
      </div>

      {/* Reset Section */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Reset Completo</h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong className="text-red-600">ATTENZIONE:</strong> Questa azione eliminerà definitivamente tutti i tuoi dati (spese, entrate, categorie, negozi, conti). Questa azione non può essere annullata.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Reset Completo</span>
        </button>
      </div>

      {/* Modale conferma reset completo */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
            <div className="bg-red-600/90 backdrop-blur-sm text-white p-6 rounded-t-2xl flex items-center justify-between">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetConfirmation('');
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Reset Completo
              </h2>
              <div className="w-6"></div>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ATTENZIONE!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Stai per eliminare <strong>DEFINITIVAMENTE</strong> tutti i tuoi dati:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-6">
                  <li>• Tutte le spese e entrate</li>
                  <li>• Tutte le categorie personalizzate</li>
                  <li>• Tutti i negozi salvati</li>
                  <li>• Tutti i conti e saldi</li>
                  <li>• Tutte le impostazioni</li>
                </ul>
                <p className="text-red-600 font-semibold">
                  Questa azione è <strong>IRREVERSIBILE</strong> e non può essere annullata!
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Per confermare, scrivi <strong>RESETTA</strong>:
                </label>
                <input
                  type="text"
                  value={resetConfirmation}
                  onChange={e => setResetConfirmation(e.target.value)}
                  placeholder="Scrivi RESETTA per continuare"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmation('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (resetConfirmation === 'RESETTA') {
                      setIsResetting(true);
                      await onResetData();
                      setIsResetting(false);
                      setShowResetConfirm(false);
                      setResetConfirmation('');
                    }
                  }}
                  disabled={resetConfirmation !== 'RESETTA' || isResetting}
                  className="flex-1 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isResetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resettando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Reset Completo
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
}

export default DataManager; 