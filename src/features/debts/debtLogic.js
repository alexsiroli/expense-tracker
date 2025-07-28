// Aggiunge un nuovo movimento di debito/credito
export function addDebtTransaction(debts, newDebt) {
  if (!validateDebtTransaction(newDebt)) throw new Error('Movimento non valido');
  // Genera sempre un nuovo id unico
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return [...debts, { ...newDebt, id: uniqueId, _type: 'debt' }];
}

// Modifica un movimento esistente per id
export function editDebtTransaction(debts, id, updatedFields) {
  return debts.map(d =>
    d.id === id ? { ...d, ...updatedFields } : d
  );
}

// Elimina un movimento per id
export function deleteDebtTransaction(debts, id) {
  return debts.filter(d => d.id !== id);
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

// Valida un movimento di debito/credito
export function validateDebtTransaction(debt) {
  return !!debt &&
    typeof debt.amount === 'number' && debt.amount > 0 &&
    !!debt.personName &&
    !!debt.walletId &&
    !!debt.date &&
    validateDateNotFuture(debt.date);
}

// Calcola il saldo con una persona specifica
export function calculatePersonBalance(debts, personName) {
  if (!personName) return 0;
  
  const personDebts = debts.filter(d => d.personName === personName);
  return personDebts.reduce((balance, debt) => {
    // Se è un debito (l'utente deve restituire), il saldo diminuisce
    // Se è un credito (l'utente deve ricevere), il saldo aumenta
    return balance + (debt.type === 'credit' ? debt.amount : -debt.amount);
  }, 0);
}

// Ottiene tutte le persone uniche dai movimenti
export function getUniquePersons(debts) {
  return Array.from(new Set(debts.map(d => d.personName))).sort((a, b) => 
    a.localeCompare(b, 'it', { sensitivity: 'base' })
  );
}

// Ottiene tutti i movimenti di una persona specifica
export function getPersonTransactions(debts, personName) {
  return debts.filter(d => d.personName === personName)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateB - dateA;
    });
}

// Crea un movimento di risoluzione per azzerare il saldo con una persona
export function createResolutionTransaction(personName, balance, walletId = '') {
  const amount = Math.abs(balance);
  const type = balance > 0 ? 'debt' : 'credit'; // Se il saldo è positivo, creiamo un debito per azzerarlo
  
  return {
    personName,
    amount,
    type,
    walletId,
    description: 'Risoluzione situazione',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5)
  };
}

// Elimina tutti i movimenti di una persona
export function deletePersonTransactions(debts, personName) {
  return debts.filter(d => d.personName !== personName);
}

// Calcola i trasferimenti automatici tra conti quando si elimina una persona
export function calculateAutomaticTransfers(debts, personName) {
  if (!personName) return [];
  
  const personTransactions = debts.filter(d => d.personName === personName);
  if (personTransactions.length === 0) return [];
  
  // Raggruppa i movimenti per wallet
  const walletMovements = {};
  
  personTransactions.forEach(transaction => {
    const walletId = transaction.walletId;
    if (!walletMovements[walletId]) {
      walletMovements[walletId] = { total: 0, transactions: [] };
    }
    
    // Calcola l'impatto sul wallet
    // Se è un credito (ho dato soldi), il wallet diminuisce
    // Se è un debito (ho ricevuto soldi), il wallet aumenta
    const impact = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
    walletMovements[walletId].total += impact;
    walletMovements[walletId].transactions.push(transaction);
  });
  
  // Trova i wallet con saldi non zero
  const walletsWithBalance = Object.entries(walletMovements)
    .filter(([_, data]) => Math.abs(data.total) > 0.01) // Tolleranza per errori di arrotondamento
    .map(([walletId, data]) => ({ walletId, balance: data.total }));
  
  // Se c'è solo un wallet con saldo non zero, non serve trasferimento
  if (walletsWithBalance.length <= 1) return [];
  
  // Ordina per saldo (dal più negativo al più positivo)
  walletsWithBalance.sort((a, b) => a.balance - b.balance);
  
  const transfers = [];
  let i = 0;
  let j = walletsWithBalance.length - 1;
  
  // Crea trasferimenti bilanciando i saldi
  while (i < j) {
    const negativeWallet = walletsWithBalance[i];
    const positiveWallet = walletsWithBalance[j];
    
    if (Math.abs(negativeWallet.balance) < 0.01) {
      i++;
      continue;
    }
    
    if (Math.abs(positiveWallet.balance) < 0.01) {
      j--;
      continue;
    }
    
    // Calcola l'importo del trasferimento
    const transferAmount = Math.min(Math.abs(negativeWallet.balance), positiveWallet.balance);
    
    if (transferAmount > 0.01) {
      transfers.push({
        fromWalletId: negativeWallet.walletId,
        toWalletId: positiveWallet.walletId,
        amount: transferAmount,
        description: `Trasferimento automatico da eliminazione ${personName}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      });
      
      // Aggiorna i saldi
      negativeWallet.balance += transferAmount;
      positiveWallet.balance -= transferAmount;
    }
    
    // Se un wallet è stato azzerato, passa al successivo
    if (Math.abs(negativeWallet.balance) < 0.01) i++;
    if (Math.abs(positiveWallet.balance) < 0.01) j--;
  }
  
  return transfers;
}

// Elimina una persona e restituisce i trasferimenti automatici necessari
export function deletePersonWithAutomaticTransfers(debts, personName) {
  const transfers = calculateAutomaticTransfers(debts, personName);
  const remainingDebts = deletePersonTransactions(debts, personName);
  
  return {
    remainingDebts,
    automaticTransfers: transfers
  };
} 