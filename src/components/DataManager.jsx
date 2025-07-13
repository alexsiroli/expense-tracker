import { useState } from 'react';
import { Download, Upload, Database, AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react';

function DataManager({ onImportData, onResetData, onShowImportModal, onShowResetModal }) {

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
          onClick={onShowResetModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-red-700/90 transition-all duration-200 transform hover:scale-105"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Reset Completo</span>
        </button>
      </div>

    </div>
  );
}

export default DataManager; 