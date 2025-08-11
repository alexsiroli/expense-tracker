import { Trash2, TrendingUp, TrendingDown, AlertCircle, Edit, Store, DollarSign } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';

// Funzioni helper per determinare gli effetti speciali delle transazioni
const isDiabolicTransaction = (item, type) => {
  return type === 'expense' && parseFloat(item.amount) === 666;
};

const isAngelicTransaction = (item, type) => {
  return type === 'income' && parseFloat(item.amount) === 888;
};

const isTimeTravelTransaction = (item) => {
  const transactionDate = new Date(item.date);
  return transactionDate.getFullYear() === 1999 && 
         transactionDate.getMonth() === 11 && 
         transactionDate.getDate() === 31;
};

const isQuadrifoglioFortunatoTransaction = (item, type) => {
  return parseFloat(item.amount) === 777;
};

const isNataleMagicoTransaction = (item) => {
  const transactionDate = new Date(item.date);
  return transactionDate.getMonth() === 11 && 
         transactionDate.getDate() === 25;
};

const isCompleannoSpecialeTransaction = (item) => {
  const transactionDate = new Date(item.date);
  return transactionDate.getMonth() === 5 && 
         transactionDate.getDate() === 5;
};

const getTransactionEffect = (item, type) => {
  if (isTimeTravelTransaction(item)) {
    return 'animate-glitch';
  }
  if (isNataleMagicoTransaction(item)) {
    return 'animate-natale-magico';
  }
  if (isCompleannoSpecialeTransaction(item)) {
    return 'animate-compleanno-speciale';
  }
  if (isQuadrifoglioFortunatoTransaction(item, type)) {
    return 'animate-quadrifoglio-fortunato';
  }
  if (isDiabolicTransaction(item, type)) {
    return 'animate-flame';
  }
  if (isAngelicTransaction(item, type)) {
    return 'animate-angelic';
  }
  return '';
};

// Componente separato per gestire il swipe
const ExpenseItem = ({ item, onDelete, onEdit, onShowDetail, getItemType, getCategoryIcon, getTransactionEffect, isQuadrifoglioFortunatoTransaction, isCompleannoSpecialeTransaction, isNataleMagicoTransaction }) => {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(null);
  const threshold = 60; // px

  // Touch events
  const handleTouchStart = (e) => {
    setSwiping(true);
    startXRef.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setSwipeX(deltaX);
  };
  const handleTouchEnd = () => {
    setSwiping(false);
    if (swipeX < -threshold) {
      onDelete(item);
    } else if (swipeX > threshold) {
      onEdit(item);
    }
    setSwipeX(0);
  };

  // Mouse events (desktop)
  const handleMouseDown = (e) => {
    setSwiping(true);
    startXRef.current = e.clientX;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!swiping) return;
    const deltaX = e.clientX - startXRef.current;
    setSwipeX(deltaX);
  };
  const handleMouseUp = () => {
    setSwiping(false);
    if (swipeX < -threshold) {
      onDelete(item);
    } else if (swipeX > threshold) {
      onEdit(item);
    }
    setSwipeX(0);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`expense-item p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${getTransactionEffect(item, getItemType(item))} relative`}
      onClick={() => onShowDetail && onShowDetail(item, getItemType(item))}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ 
        transform: `translateX(${swipeX}px)`, 
        transition: swiping ? 'none' : 'transform 0.2s',
        boxShadow: '2px 0 0 rgba(239, 68, 68, 0.6), -2px 0 0 rgba(59, 130, 246, 0.6)'
      }}
    >
      {/* Overlay emoji per quadrifoglio fortunato */}
      {isQuadrifoglioFortunatoTransaction(item, getItemType(item)) && (
        <div className="emoji-overlay">
          {Array.from({ length: 15 }, (_, i) => (
            <span
              key={i}
              className="emoji-fortuna"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {i % 2 === 0 ? '🍀' : '💰'}
            </span>
          ))}
        </div>
      )}

      {/* Overlay emoji per compleanno speciale */}
      {isCompleannoSpecialeTransaction(item) && (
        <div className="emoji-overlay">
          {Array.from({ length: 15 }, (_, i) => (
            <span
              key={i}
              className="emoji-birthday"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {i % 2 === 0 ? '🎂' : '🎁'}
            </span>
          ))}
        </div>
      )}

      {/* Overlay emoji per natale magico */}
      {isNataleMagicoTransaction(item) && (
        <div className="emoji-overlay">
          {Array.from({ length: 15 }, (_, i) => (
            <span
              key={i}
              className="emoji-natale"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {i % 3 === 0 ? '❄️' : i % 3 === 1 ? '🎄' : '🎁'}
            </span>
          ))}
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-3">
          {/* Category Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm flex items-center justify-center text-lg mt-3">
              {getCategoryIcon(item.category, getItemType(item))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-0.5">
              <div className="flex-1 min-w-0 max-w-[60%]">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-base">
                  {item.store || 'Senza negozio'}
                </h3>
              </div>
              <div className={`flex items-end justify-end mt-3 flex-shrink-0`}>
                <span className={`px-3 py-1 rounded-xl border font-bold text-base shadow-sm ${getItemType(item) === 'expense' ? 'text-red-700 border-red-200 bg-red-50 dark:text-red-300 dark:border-red-700 dark:bg-red-900/30' : 'text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-700 dark:bg-green-900/30'}`}
                      style={{ textAlign: 'right' }}>
                  {getItemType(item) === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 -mt-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600 border border-blue-600/20">
                  {item.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(item.date), 'HH:mm', { locale: it })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ExpenseList({ items, onDelete, onEdit, type, categories = [], onShowDetail }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: it });
  };

  const getCategoryIcon = (categoryName, itemType) => {
    // Per il tipo mixed, usa le categorie appropriate in base al tipo di transazione
    const categoryList = type === 'mixed' 
      ? (itemType === 'expense' ? categories.expense : categories.income)
      : categories;
    const category = categoryList.find(cat => cat.name === categoryName);
    return category?.icon || '📦';
  };

  // Determina il tipo di transazione per ogni item
  const getItemType = (item) => {
    if (type === 'mixed') {
      return item._type || 'expense';
    }
    return type;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            {type === 'mixed' ? (
              <DollarSign className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            ) : type === 'expense' ? (
              <TrendingDown className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            ) : (
              <TrendingUp className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
            {type === 'mixed' ? 'Nessuna transazione registrata' : 
             `Nessuna ${type === 'expense' ? 'spesa' : 'entrata'} registrata`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {type === 'mixed' ? 'Aggiungi la tua prima transazione per iniziare' :
             `Aggiungi la tua prima ${type === 'expense' ? 'spesa' : 'entrata'} per iniziare`}
          </p>
        </div>
      </div>
    );
  }

  // Raggruppa le transazioni per data
  const groupedItems = items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((groups, item) => {
      const date = item.date.split('T')[0]; // Prendi solo la data senza l'ora
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});

  // Ordina le transazioni all'interno di ogni gruppo per ora (più recenti prima)
  Object.keys(groupedItems).forEach(date => {
    groupedItems[date].sort((a, b) => {
      const timeA = a.date.includes('T') ? a.date.split('T')[1] : '00:00:00';
      const timeB = b.date.includes('T') ? b.date.split('T')[1] : '00:00:00';
      return timeB.localeCompare(timeA); // Ordina per ora decrescente (più recenti prima)
    });
  });

  const formatDateHeader = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateString === today) {
      return 'Oggi';
    } else if (dateString === yesterday) {
      return 'Ieri';
    } else {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy', { locale: it });
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date} className="space-y-3">
          {/* Header della data */}
          <div className="sticky top-36 z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-3 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {formatDateHeader(date)}
            </h3>
          </div>
          
          {/* Transazioni del giorno */}
          <div className="space-y-3">
            {dateItems.map((item) => (
              <ExpenseItem
                key={item.id}
                item={item}
                onDelete={onDelete}
                onEdit={onEdit}
                onShowDetail={onShowDetail}
                getItemType={getItemType}
                getCategoryIcon={getCategoryIcon}
                getTransactionEffect={getTransactionEffect}
                isQuadrifoglioFortunatoTransaction={isQuadrifoglioFortunatoTransaction}
                isCompleannoSpecialeTransaction={isCompleannoSpecialeTransaction}
                isNataleMagicoTransaction={isNataleMagicoTransaction}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList; 