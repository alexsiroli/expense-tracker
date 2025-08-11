import { useEffect, useCallback } from 'react';
import { useFirestore } from './useFirestore';
import { isFutureDate } from '../features/expenses/expenseLogic';
import { getCurrentRomeTime } from '../utils/formatters';

export const useFutureTransactions = () => {
  const { updateDocument, deleteDocument } = useFirestore();

  // Funzione per spostare una transazione futura a oggi
  const moveToCurrent = useCallback(async (transaction) => {
    try {
      const now = getCurrentRomeTime();
      
      // Mantieni l'ora originale della transazione, ma aggiorna la data a oggi
      const transactionDate = new Date(transaction.date);
      const todayWithOriginalTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        transactionDate.getHours(),
        transactionDate.getMinutes(),
        transactionDate.getSeconds()
      );
      
      // Aggiorna la data della transazione a oggi con l'ora originale
      if (transaction._type === 'expense') {
        await updateDocument('expenses', transaction.id, {
          date: todayWithOriginalTime.toISOString()
        });
      } else if (transaction._type === 'income') {
        await updateDocument('incomes', transaction.id, {
          date: todayWithOriginalTime.toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Errore durante lo spostamento della transazione futura:', error);
      throw error;
    }
  }, [updateDocument]);

  // Funzione per controllare e spostare automaticamente le transazioni future scadute
  const checkAndMoveExpiredTransactions = useCallback(async (expenses = [], incomes = []) => {
    try {
      const now = getCurrentRomeTime();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Trova le spese future scadute
      const expiredExpenses = expenses.filter(expense => {
        if (!isFutureDate(expense.date)) return false;
        const expenseDate = new Date(expense.date);
        // Controlla se la transazione è effettivamente scaduta (data + ora)
        return expenseDate <= now;
      });
      
      // Trova le entrate future scadute
      const expiredIncomes = incomes.filter(income => {
        if (!isFutureDate(income.date)) return false;
        const incomeDate = new Date(income.date);
        // Controlla se la transazione è effettivamente scaduta (data + ora)
        return incomeDate <= now;
      });
      
      // Sposta le transazioni scadute
      const movePromises = [];
      
      expiredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const todayWithOriginalTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          expenseDate.getHours(),
          expenseDate.getMinutes(),
          expenseDate.getSeconds()
        );
        
        movePromises.push(
          updateDocument('expenses', expense.id, {
            date: todayWithOriginalTime.toISOString()
          })
        );
      });
      
      expiredIncomes.forEach(income => {
        const incomeDate = new Date(income.date);
        const todayWithOriginalTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          incomeDate.getHours(),
          incomeDate.getMinutes(),
          incomeDate.getSeconds()
        );
        
        movePromises.push(
          updateDocument('incomes', income.id, {
            date: todayWithOriginalTime.toISOString()
          })
        );
      });
      
      if (movePromises.length > 0) {
        await Promise.all(movePromises);
        console.log(`Spostate ${movePromises.length} transazioni future scadute`);
      }
      
      return {
        movedExpenses: expiredExpenses.length,
        movedIncomes: expiredIncomes.length
      };
    } catch (error) {
      console.error('Errore durante il controllo delle transazioni future scadute:', error);
      throw error;
    }
  }, [updateDocument]);

  // Controlla automaticamente ogni ora se ci sono transazioni da spostare
  useEffect(() => {
    const interval = setInterval(() => {
      // Questo verrà chiamato ogni ora, ma la logica effettiva
      // dovrebbe essere implementata nel componente che usa questo hook
      // passando le transazioni correnti
    }, 60 * 60 * 1000); // 1 ora

    return () => clearInterval(interval);
  }, []);

  return {
    moveToCurrent,
    checkAndMoveExpiredTransactions
  };
};
