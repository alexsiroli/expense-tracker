// Aggiunge un nuovo wallet
export function addWallet(wallets, newWallet) {
  if (!newWallet || !newWallet.name || !newWallet.color) throw new Error('Conto non valido');
  if (wallets.some(w => w.name === newWallet.name)) throw new Error('Conto già esistente');
  // Genera sempre un nuovo id unico deterministico (come per le transazioni)
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return [...wallets, { ...newWallet, id: uniqueId, balance: newWallet.balance ?? 0, initialBalance: newWallet.initialBalance ?? 0 }];
}

// Modifica un wallet esistente per id
export function editWallet(wallets, id, updatedFields) {
  return wallets.map(w =>
    w.id === id ? { ...w, ...updatedFields, id: w.id } : w
  );
}

// Elimina un wallet per id
export function deleteWallet(wallets, id) {
  return wallets.filter(w => w.id !== id);
}

// Valida un wallet (nome e colore obbligatori)
export function validateWallet(wallet) {
  return !!wallet && !!wallet.name && !!wallet.color;
}

// Calcola il saldo di un wallet dato array di transazioni
export function calculateWalletBalance(wallet, expenses, incomes) {
  if (!wallet) return 0;
  // Gestisce sia i vecchi ID numerici che i nuovi ID stringa
  const totalIn = incomes.filter(i => i.walletId === wallet.id || i.walletId === wallet.name).reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalOut = expenses.filter(e => e.walletId === wallet.id || e.walletId === wallet.name).reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const baseBalance = wallet.initialBalance !== undefined ? wallet.initialBalance : wallet.balance;
  return baseBalance + totalIn - totalOut;
} 