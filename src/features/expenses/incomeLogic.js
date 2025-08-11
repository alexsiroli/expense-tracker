import { getCurrentRomeTime } from '../../utils/formatters';

// Aggiunge una nuova entrata
export function addIncome(incomes, newIncome) {
  if (!validateIncome(newIncome)) throw new Error('Entrata non valida');
  // Genera sempre un nuovo id unico
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return [...incomes, { ...newIncome, id: uniqueId }];
}

// Modifica una entrata esistente per id
export function editIncome(incomes, id, updatedFields) {
  return incomes.map(i =>
    i.id === id ? { ...i, ...updatedFields } : i
  );
}

// Elimina una entrata per id
export function deleteIncome(incomes, id) {
  return incomes.filter(i => i.id !== id);
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

// Valida una entrata (importo > 0, categoria e data obbligatorie, data può essere futura)
export function validateIncome(income) {
  return !!income &&
    typeof income.amount === 'number' && income.amount > 0 &&
    !!income.category &&
    !!income.date;
} 