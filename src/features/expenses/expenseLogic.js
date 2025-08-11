import { getCurrentRomeTime } from '../../utils/formatters';

// Aggiunge una nuova spesa
export function addExpense(expenses, newExpense) {
  if (!validateExpense(newExpense)) throw new Error('Spesa non valida');
  // Genera sempre un nuovo id unico
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return [...expenses, { ...newExpense, id: uniqueId }];
}

// Modifica una spesa esistente per id
export function editExpense(expenses, id, updatedFields) {
  return expenses.map(e =>
    e.id === id ? { ...e, ...updatedFields } : e
  );
}

// Elimina una spesa per id
export function deleteExpense(expenses, id) {
  return expenses.filter(e => e.id !== id);
}

// Controlla se la data è nel futuro
export function isFutureDate(date) {
  if (!date) return false;
  const transactionDate = new Date(date);
  // Usa l'orario di Roma invece dell'orario locale
  const now = getCurrentRomeTime();
  
  // Se la data è diversa da oggi, confronta solo la data
  const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (transactionDateOnly > todayOnly) {
    return true; // Data futura
  } else if (transactionDateOnly < todayOnly) {
    return false; // Data passata
  } else {
    // È oggi: controlla l'ora
    return transactionDate > now; // True se l'ora è nel futuro
  }
}

// Valida che la data non sia nel futuro (per compatibilità)
export function validateDateNotFuture(date) {
  if (!date) return false;
  
  try {
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) return false;
    
    return !isFutureDate(date);
  } catch (error) {
    return false;
  }
}

// Valida una spesa (importo > 0, categoria e data obbligatorie, data può essere futura)
export function validateExpense(expense) {
  return !!expense &&
    typeof expense.amount === 'number' && expense.amount > 0 &&
    !!expense.category &&
    !!expense.date;
} 