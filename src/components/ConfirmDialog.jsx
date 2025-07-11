import { Trash2, AlertTriangle } from 'lucide-react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{message}</p>
          
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