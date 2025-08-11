import React, { useState, useEffect } from 'react';

const CustomPopup = ({ open, onClose, title, message, icon, type = 'success', medal, animation, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setHasAnimated(false);
      // Trigger entrance animation after a small delay
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setHasAnimated(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-xs w-full p-6 relative transform transition-all duration-500 ease-out ${
          isVisible && hasAnimated 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Icona e titolo */}
        <div className="text-center mb-4">
          {icon && (
            <div className="text-4xl mb-3">
              {icon}
            </div>
          )}
          {title && <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>}
        </div>
        {/* Messaggio */}
        {message && (
          <div className="text-center text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {typeof message === 'string' ? message : message}
          </div>
        )}
        {/* Medaglia sbloccata */}
        {medal && (
          <div className="flex flex-col items-center my-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${medal.bgColor} flex items-center justify-center text-4xl shadow-lg mb-2 animate-bounce`}>{medal.icon}</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{medal.title}</div>
          </div>
        )}
        {/* Children opzionali */}
        {children}
        {/* Pulsante chiudi - solo se non ci sono children personalizzati */}
        {!children && (
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-blue-600/90 text-white rounded-xl font-semibold hover:bg-blue-700/90 transition-all"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomPopup; 