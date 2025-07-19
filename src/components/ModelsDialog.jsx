import React, { useState, useRef } from 'react';
import { X, Plus, TrendingDown, TrendingUp, Edit, Trash2, Play } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Componente separato per gestire il swipe dei modelli
const ModelItem = ({ model, onUseModel, onEditModel, onDeleteModel, categories, type }) => {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(null);
  const tileRef = useRef(null);
  const threshold = 60; // px

  // Touch events
  const handleTouchStart = (e) => {
    console.log('TOUCH START'); // Debug
    setSwiping(true);
    startXRef.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    console.log('TOUCH MOVE - DeltaX:', deltaX); // Debug
    console.log('Element style before:', tileRef.current?.style.transform); // Debug
    
    // SOLUZIONE LOGICA: Aggiorna solo lo state, React si occupa del resto
    setSwipeX(deltaX);
    
    console.log('Element style after:', tileRef.current?.style.transform); // Debug
  };
  const handleTouchEnd = () => {
    console.log('TOUCH END - Final swipeX:', swipeX); // Debug
    setSwiping(false);
    if (swipeX < -threshold) {
      onDeleteModel(model);
    } else if (swipeX > threshold) {
      onEditModel(model);
    }
    setSwipeX(0);
  };

  // Mouse events (desktop)
  const handleMouseDown = (e) => {
    console.log('MOUSE DOWN'); // Debug
    setSwiping(true);
    startXRef.current = e.clientX;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!swiping) return;
    const deltaX = e.clientX - startXRef.current;
    console.log('MOUSE MOVE - DeltaX:', deltaX); // Debug
    
    // SOLUZIONE LOGICA: Aggiorna solo lo state, React si occupa del resto
    setSwipeX(deltaX);
  };
  const handleMouseUp = () => {
    console.log('MOUSE UP - Final swipeX:', swipeX); // Debug
    setSwiping(false);
    if (swipeX < -threshold) {
      onDeleteModel(model);
    } else if (swipeX > threshold) {
      onEditModel(model);
    }
    setSwipeX(0);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const categoryIcon = model.category && categories.find(cat => cat.name === model.category)?.icon;

  const handleClick = () => {
    onUseModel(model);
  };

  return (
    <div 
      ref={tileRef}
      className="card p-4 hover:shadow-lg transition-all duration-200 relative overflow-hidden cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{ 
        transform: `translate3d(${swipeX}px, 0, 0)`, 
        transition: swiping ? 'none' : 'transform 0.2s ease-out',
        willChange: 'transform',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        boxShadow: '2px 0 0 rgba(239, 68, 68, 0.6), -2px 0 0 rgba(59, 130, 246, 0.6)'
      }}
      data-swipe-x={swipeX} // Debug
    >
      {/* Contenuto del modello */}
      <div className="flex items-center gap-3">
        {/* Icona categoria */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-lg">
            {categoryIcon || '❓'}
          </span>
        </div>
        
        {/* Nome del modello */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {model.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

function ModelsDialog({ 
  isOpen, 
  onClose, 
  type, 
  models = [], 
  onAddModel, 
  onEditModel, 
  onDeleteModel, 
  onUseModel,
  categories = []
}) {
  const dialogTitle = type === 'expense' ? 'Modelli Spese' : 'Modelli Entrate';
  const dialogIcon = type === 'expense' ? TrendingDown : TrendingUp;
  
  const filteredModels = models.filter(model => model.type === type);
  
  const handleAddModel = () => {
    onAddModel();
  };

  const handleUseModel = (model) => {
    onUseModel(model);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`p-4 rounded-t-2xl ${type === 'expense' ? 'bg-red-600/90' : 'bg-green-600/90'} backdrop-blur-sm text-white`}>
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">
              {dialogTitle}
            </h2>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="p-6 h-full overflow-y-auto max-h-[60vh]">
            {filteredModels.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {dialogIcon && React.createElement(dialogIcon, { className: "w-8 h-8 text-gray-400 dark:text-gray-500" })}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Nessun modello salvato
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Crea il tuo primo modello per velocizzare l'inserimento delle transazioni
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredModels.map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    onUseModel={handleUseModel}
                    onEditModel={onEditModel}
                    onDeleteModel={onDeleteModel}
                    categories={categories}
                    type={type}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleAddModel}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Modello
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModelsDialog; 