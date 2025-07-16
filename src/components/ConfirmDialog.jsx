import { Trash2, AlertTriangle, X } from 'lucide-react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 border border-gray-200 dark:border-gray-700 p-6" onClick={e => e.stopPropagation()}>
        {/* Header con X */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annulla
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn btn-danger flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog; 