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

// Valida che la data non sia nel futuro
export function validateDateNotFuture(date) {
  if (!date) return false;
  const transactionDate = new Date(date);
  const now = new Date();
  // Confronta solo la data (ignora l'ora) per permettere transazioni di oggi
  const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return transactionDateOnly <= todayOnly;
}

// Valida una spesa (importo > 0, categoria e data obbligatorie, data non nel futuro)
export function validateExpense(expense) {
  return !!expense &&
    typeof expense.amount === 'number' && expense.amount > 0 &&
    !!expense.category &&
    !!expense.date &&
    validateDateNotFuture(expense.date);
} 