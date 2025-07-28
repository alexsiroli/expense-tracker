import { useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DebtTransactionItem = ({ 
  transaction, 
  onShowDetail,
  onDelete,
  onEdit,
  getWalletName 
}) => {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(null);
  const tileRef = useRef(null);
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
      onDelete(transaction.id);
    } else if (swipeX > threshold) {
      onEdit(transaction);
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
      onDelete(transaction.id);
    } else if (swipeX > threshold) {
      onEdit(transaction);
    }
    setSwipeX(0);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = () => {
    if (onShowDetail) {
      onShowDetail(transaction);
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 
      'text-green-600 dark:text-green-400' : 
      'text-red-600 dark:text-red-400';
  };



  return (
    <div
      ref={tileRef}
      className="card py-3 px-4 flex items-center justify-between rounded-xl shadow transition-all relative mx-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
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
        boxShadow: '4px 0 0 rgba(239, 68, 68, 0.6), -4px 0 0 rgba(59, 130, 246, 0.6)'
      }}
    >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {getTransactionIcon(transaction.type)}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
              {transaction.type === 'credit' ? 'Credito' : 'Debito'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>
    );
  };

export default DebtTransactionItem; 