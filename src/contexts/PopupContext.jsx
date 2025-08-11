import React, { createContext, useContext, useState } from 'react';
import CustomPopup from '../components/CustomPopup';

const PopupContext = createContext();

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    open: false,
    title: '',
    message: '',
    icon: null,
    type: 'success',
    medal: null,
    animation: null,
    children: null
  });

  const showPopup = (config) => {
    setPopup({
      ...config,
      open: true
    });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, open: false }));
  };

  const showAlert = (message, title = 'Attenzione') => {
    showPopup({
      title,
      message,
      type: 'info',
      icon: 'ℹ️'
    });
  };

  const showSuccess = (message, title = 'Successo') => {
    showPopup({
      title,
      message,
      type: 'success',
      icon: '✅'
    });
  };

  const showError = (message, title = 'Errore') => {
    showPopup({
      title,
      message,
      type: 'error',
      icon: '❌'
    });
  };

  const showEasterEgg = (easterEgg) => {
    showPopup({
      title: 'Easter Egg Sbloccato! 🎉',
      message: easterEgg.activationMessage,
      type: 'success',
      medal: {
        icon: easterEgg.icon,
        title: easterEgg.title,
        bgColor: easterEgg.bgColor
      }
    });
  };

  const showConfirm = (message, title = 'Conferma', onConfirm, onCancel) => {
    showPopup({
      title,
      message: typeof message === 'string' ? message : '',
      type: 'confirm',
      icon: '⚠️',
      children: (
        <>
          {typeof message !== 'string' && (
            <div className="mb-4">
              {message}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                hidePopup();
                onConfirm?.();
            }}
              className="flex-1 py-3 bg-blue-600/90 text-white rounded-xl font-semibold hover:bg-blue-700/90 transition-all duration-200 transform hover:scale-105"
            >
              Conferma
            </button>
            <button
              onClick={() => {
                hidePopup();
                onCancel?.();
              }}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
            >
              Annulla
            </button>
          </div>
        </>
      )
    });
  };

  const value = {
    showPopup,
    hidePopup,
    showAlert,
    showSuccess,
    showError,
    showEasterEgg,
    showConfirm
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      <CustomPopup
        open={popup.open}
        onClose={hidePopup}
        title={popup.title}
        message={popup.message}
        icon={popup.icon}
        type={popup.type}
        medal={popup.medal}
        animation={popup.animation}
      >
        {popup.children}
      </CustomPopup>
    </PopupContext.Provider>
  );
}; 