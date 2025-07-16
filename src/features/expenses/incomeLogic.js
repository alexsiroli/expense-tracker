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

// Valida una entrata (importo > 0, categoria e data obbligatorie, data non nel futuro)
export function validateIncome(income) {
  return !!income &&
    typeof income.amount === 'number' && income.amount > 0 &&
    !!income.category &&
    !!income.date &&
    validateDateNotFuture(income.date);
} 