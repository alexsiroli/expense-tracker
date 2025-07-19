// Logica per gestire i modelli di spese e entrate

/**
 * Valida un modello
 * @param {Object} model - Il modello da validare
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateModel = (model) => {
  const errors = [];

  // Per i modelli, il nome è obbligatorio
  if (!model.name || model.name.trim() === '') {
    errors.push('Il nome del modello è obbligatorio');
  }

  // Il tipo deve essere valido
  if (!model.type || !['expense', 'income'].includes(model.type)) {
    errors.push('Il tipo deve essere "expense" o "income"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Crea un nuovo modello
 * @param {Array} models - Array dei modelli esistenti
 * @param {Object} newModel - Il nuovo modello da aggiungere
 * @returns {Array} - Array aggiornato dei modelli
 */
export const addModel = (models, newModel) => {
  const validation = validateModel(newModel);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const modelToAdd = {
    ...newModel,
    id: Date.now().toString(), // ID semplice basato su timestamp
    createdAt: new Date().toISOString(),
    name: newModel.name.trim(),
    category: newModel.category ? newModel.category.trim() : '',
    store: newModel.store ? newModel.store.trim() : '',
    note: newModel.note ? newModel.note.trim() : '',
    amount: newModel.amount ? parseFloat(newModel.amount) : 0
  };

  return [...models, modelToAdd];
};

/**
 * Modifica un modello esistente
 * @param {Array} models - Array dei modelli esistenti
 * @param {string} id - ID del modello da modificare
 * @param {Object} updatedFields - Campi da aggiornare
 * @returns {Array} - Array aggiornato dei modelli
 */
export const editModel = (models, id, updatedFields) => {
  const validation = validateModel({ ...models.find(m => m.id === id), ...updatedFields });
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  return models.map(model => 
    model.id === id 
              ? { 
            ...model, 
            ...updatedFields,
            name: updatedFields.name ? updatedFields.name.trim() : (model.name || 'Modello senza nome'),
            category: updatedFields.category ? updatedFields.category.trim() : (model.category || ''),
            store: updatedFields.store ? updatedFields.store.trim() : (model.store || ''),
            note: updatedFields.note ? updatedFields.note.trim() : (model.note || ''),
            amount: updatedFields.amount ? parseFloat(updatedFields.amount) : (model.amount || 0),
            updatedAt: new Date().toISOString()
          }
      : model
  );
};

/**
 * Elimina un modello
 * @param {Array} models - Array dei modelli esistenti
 * @param {string} id - ID del modello da eliminare
 * @returns {Array} - Array aggiornato dei modelli
 */
export const deleteModel = (models, id) => {
  return models.filter(model => model.id !== id);
};

/**
 * Ottiene i modelli filtrati per tipo
 * @param {Array} models - Array dei modelli
 * @param {string} type - Tipo di modello ('expense' o 'income')
 * @returns {Array} - Modelli filtrati
 */
export const getModelsByType = (models, type) => {
  return models.filter(model => model.type === type);
};

/**
 * Applica un modello per creare una transazione
 * @param {Object} model - Il modello da applicare
 * @param {string} walletId - ID del portafoglio
 * @returns {Object} - Transazione creata dal modello
 */
export const applyModel = (model, walletId) => {
  return {
    description: model.name,
    amount: model.amount,
    category: model.category,
    store: model.store || '',
    note: model.note || '',
    walletId: walletId,
    date: new Date().toISOString(),
    _type: model.type
  };
}; 