// Aggiunge una nuova categoria, restituisce il nuovo array
export function addCategory(categories, newCategory) {
  if (!newCategory || !newCategory.name || !newCategory.icon) throw new Error('Categoria non valida');
  if (categories.some(cat => cat.name === newCategory.name)) throw new Error('Categoria già esistente');
  return [...categories, { ...newCategory, id: Date.now() }];
}

// Modifica una categoria esistente per id
export function editCategory(categories, id, updatedFields) {
  return categories.map(cat =>
    cat.id === id ? { ...cat, ...updatedFields } : cat
  );
}

// Elimina una categoria per id
export function deleteCategory(categories, id) {
  return categories.filter(cat => cat.id !== id);
}

// Valida una categoria (nome non vuoto, icona presente)
export function validateCategory(category) {
  return !!category && !!category.name && !!category.icon;
} 