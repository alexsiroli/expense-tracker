import { useState, useRef } from 'react';
import { User, Euro, ArrowRight, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DebtList = ({ 
  debts = [], 
  onPersonClick, 
  onAddDebt, 
  onAddCredit,
  onEditDebt,
  onDeleteDebt,
  onShowDetail
}) => {


  // Get unique persons and calculate their balances
  const getPersonsWithBalances = () => {
    const personMap = new Map();
    
    debts.forEach(debt => {
      const personName = debt.personName;
      if (!personMap.has(personName)) {
        personMap.set(personName, {
          name: personName,
          balance: 0,
          transactions: []
        });
      }
      
      const person = personMap.get(personName);
      person.transactions.push(debt);
      
      // Calculate balance: positive for credits (user should receive), negative for debts (user should pay)
      if (debt.type === 'credit') {
        person.balance += debt.amount;
      } else {
        person.balance -= debt.amount;
      }
    });
    
    return Array.from(personMap.values())
      .sort((a, b) => {
        // Get the most recent transaction for each person
        const aLatestTransaction = a.transactions.reduce((latest, current) => {
          const currentDateTime = new Date(current.date + 'T' + (current.time || '00:00'));
          const latestDateTime = new Date(latest.date + 'T' + (latest.time || '00:00'));
          return currentDateTime > latestDateTime ? current : latest;
        }, a.transactions[0]); // Start with first transaction
        const bLatestTransaction = b.transactions.reduce((latest, current) => {
          const currentDateTime = new Date(current.date + 'T' + (current.time || '00:00'));
          const latestDateTime = new Date(latest.date + 'T' + (latest.time || '00:00'));
          return currentDateTime > latestDateTime ? current : latest;
        }, b.transactions[0]); // Start with first transaction
        
        // Sort by most recent transaction date and time (newest first)
        const aDateTime = new Date(aLatestTransaction.date + 'T' + (aLatestTransaction.time || '00:00'));
        const bDateTime = new Date(bLatestTransaction.date + 'T' + (bLatestTransaction.time || '00:00'));
        return bDateTime - aDateTime;
      });
  };

  const persons = getPersonsWithBalances();



  const getBalanceColor = (balance) => {
    if (balance > 0) {
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40';
    } else if (balance < 0) {
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40';
    }
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/40';
  };

  const getBalanceIcon = (balance) => {
    if (balance > 0) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (balance < 0) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Euro className="w-4 h-4" />;
  };

  const getBalanceText = (balance) => {
    if (balance > 0) {
      return formatCurrency(balance);
    } else if (balance < 0) {
      return formatCurrency(Math.abs(balance));
    }
    return 'In pari';
  };

  if (persons.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Nessun debito o credito
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Inizia ad aggiungere movimenti di debito o credito
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => onAddDebt()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 backdrop-blur-sm text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 active:scale-95 font-medium"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Nuovo Debito</span>
          </button>
          <button
            onClick={() => onAddCredit()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 backdrop-blur-sm text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 active:scale-95 font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Nuovo Credito</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con pulsanti - stile identico alle transazioni */}
      <div className="sticky top-20 lg:top-4 z-20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl max-w-md mx-auto px-6 py-3 mb-6 shadow-lg lg:max-w-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Debiti e Crediti</h2>
        </div>

        {/* Bottoni per aggiungere debiti/crediti - stile identico alle transazioni */}
        <div className="flex gap-3">
          <button
            onClick={() => onAddDebt()}
            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-red-600 backdrop-blur-sm text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 active:scale-95 font-medium"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Nuovo Debito</span>
          </button>
          <button
            onClick={() => onAddCredit()}
            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-500 to-green-600 backdrop-blur-sm text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 active:scale-95 font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Nuovo Credito</span>
          </button>
        </div>
      </div>

      {/* Lista persone */}
      <div className="space-y-3">
        {persons.map((person) => (
          <div
            key={person.name}
            className="card py-4 px-4 w-full max-w-md mx-auto flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl shadow transition-all lg:max-w-none"
            onClick={() => onPersonClick(person)}
          >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {person.name}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm ${getBalanceColor(person.balance)}`}>
                    {getBalanceIcon(person.balance)}
                    <span>{getBalanceText(person.balance)}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default DebtList; 