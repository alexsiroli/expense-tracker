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

// Valida una entrata (importo > 0, categoria e data obbligatorie)
export function validateIncome(income) {
  return !!income &&
    typeof income.amount === 'number' && income.amount > 0 &&
    !!income.category &&
    !!income.date;
} 