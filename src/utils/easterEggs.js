// Configurazione centralizzata per tutti gli easter egg
export const easterEggs = {
  tapSegreto: {
    id: 'tapSegreto',
    title: 'Tap Segreto',
    description: 'Tap 5 volte rapidamente sul logo del portafoglio per attivare il tema arcobaleno',
    activationMessage: '🎉 Tema arcobaleno attivato! 🌈 Ora tutto è più colorato e divertente!',
    hasDeactivationMessage: false,
    priority: 1, // Priorità più bassa
    icon: '🌈',
    bgColor: 'from-red-500 to-pink-500'
  },
  tapLungo: {
    id: 'tapLungo',
    title: 'Tap Lungo',
    description: 'Tieni premuto per 3 secondi sul titolo dell\'app per attivare la modalità party',
    activationMessage: '🎊 PARTY MODE ATTIVATA! 🎉 Ora tutto balla e brilla!',
    hasDeactivationMessage: false,
    priority: 2,
    icon: '🎉',
    bgColor: 'from-blue-500 to-cyan-500'
  },
  temaSegreto: {
    id: 'temaSegreto',
    title: 'Tema Segreto',
    description: 'Doppio tap sul footer per attivare il tema retro pixel art',
    activationMessage: '🕹️ Tema retro attivato! 🎮 Benvenuto negli anni \'80!',
    hasDeactivationMessage: false,
    priority: 3,
    icon: '🎮',
    bgColor: 'from-green-500 to-emerald-500'
  },
  uscitaDiabolica: {
    id: 'uscitaDiabolica',
    title: 'Uscita Diabolica',
    description: 'Aggiungi una spesa di 666€ per attivare l\'effetto fiamme',
    activationMessage: '🔥 USCITA DIABOLICA ATTIVATA! 🔥 Il tile ora brucia con le fiamme dell\'inferno!',
    hasDeactivationMessage: false,
    priority: 4,
    icon: '📺',
    bgColor: 'from-yellow-500 to-orange-500'
  },
  entrataAngelica: {
    id: 'entrataAngelica',
    title: 'Entrata Angelica',
    description: 'Aggiungi un\'entrata di 888€ per attivare l\'effetto angelico',
    activationMessage: '👼 Entrata angelica rilevata! ✨ Effetto divino applicato!',
    hasDeactivationMessage: false,
    priority: 5,
    icon: '👼',
    bgColor: 'from-purple-500 to-indigo-500'
  },
  timeTravel: {
    id: 'timeTravel',
    title: 'Time Travel',
    description: 'Crea una transazione datata 31/12/1999 per attivare l\'effetto glitch',
    activationMessage: '🌌 Time travel rilevato! ⚡ Effetto glitch applicato!',
    hasDeactivationMessage: false,
    priority: 6,
    icon: '⏰',
    bgColor: 'from-teal-500 to-blue-500'
  },
  quadrifoglioFortunato: {
    id: 'quadrifoglioFortunato',
    title: 'Quadrifoglio Fortunato',
    description: 'Aggiungi una transazione di 777€ per attivare l\'effetto quadrifoglio fortunato',
    activationMessage: '🍀 Quadrifoglio fortunato rilevato! 💰 Effetto fortuna applicato!',
    hasDeactivationMessage: false,
    priority: 7,
    icon: '🍀',
    bgColor: 'from-green-500 to-emerald-500'
  },
  nataleMagico: {
    id: 'nataleMagico',
    title: 'Natale Magico',
    description: 'Crea una transazione il 25 dicembre per attivare l\'effetto natalizio',
    activationMessage: '🎄 Natale magico rilevato! 🎁 Effetto natalizio applicato!',
    hasDeactivationMessage: false,
    priority: 8,
    icon: '🎄',
    bgColor: 'from-red-600 to-green-600'
  },
  compleannoSpeciale: {
    id: 'compleannoSpeciale',
    title: 'Compleanno Speciale',
    description: 'Crea una transazione il 5 giugno per attivare l\'effetto compleanno',
    activationMessage: '🎂 Compleanno speciale rilevato! 🎉 Effetto festa applicato!',
    hasDeactivationMessage: false,
    priority: 9,
    icon: '🎂',
    bgColor: 'from-pink-500 to-purple-500'
  }
};

// Funzione per ottenere un easter egg specifico
export const getEasterEgg = (id) => {
  return easterEggs[id] || null;
};

// Funzione per ottenere tutti gli easter egg
export const getAllEasterEggs = () => {
  return Object.values(easterEggs);
};

// Funzione per ottenere solo i titoli per la lista
export const getEasterEggTitles = () => {
  return getAllEasterEggs().map(egg => egg.title);
};

// Funzione per disattivare tutti gli easter egg
export const deactivateAllEasterEggs = (setters) => {
  const {
    setRainbowMode,
    setPartyMode,
    setRetroMode,
    setFlameMode,
    setAngelicMode,
    setTimeTravelMode,
    setNataleMagicoMode,
    setCompleannoSpecialeMode
  } = setters || {};
  if (typeof setRainbowMode === 'function') setRainbowMode(false);
  if (typeof setPartyMode === 'function') setPartyMode(false);
  if (typeof setRetroMode === 'function') setRetroMode(false);
  if (typeof setFlameMode === 'function') setFlameMode(false);
  if (typeof setAngelicMode === 'function') setAngelicMode(false);
  if (typeof setTimeTravelMode === 'function') setTimeTravelMode(false);
  if (typeof setNataleMagicoMode === 'function') setNataleMagicoMode(false);
  if (typeof setCompleannoSpecialeMode === 'function') setCompleannoSpecialeMode(false);
};

// Funzione per attivare un easter egg specifico disattivando gli altri
export const activateEasterEgg = (id, setters) => {
  const easterEgg = getEasterEgg(id);
  if (!easterEgg) return false;
  const {
    setRainbowMode,
    setPartyMode,
    setRetroMode,
    setFlameMode,
    setAngelicMode,
    setTimeTravelMode,
    setNataleMagicoMode,
    setCompleannoSpecialeMode
  } = setters || {};
  switch (id) {
    case 'tapSegreto':
      if (typeof setRainbowMode === 'function') setRainbowMode(true);
      break;
    case 'tapLungo':
      if (typeof setPartyMode === 'function') setPartyMode(true);
      break;
    case 'temaSegreto':
      if (typeof setRetroMode === 'function') setRetroMode(true);
      break;
    case 'uscitaDiabolica':
      if (typeof setFlameMode === 'function') setFlameMode(true);
      break;
    case 'entrataAngelica':
      if (typeof setAngelicMode === 'function') setAngelicMode(true);
      break;
    case 'timeTravel':
      if (typeof setTimeTravelMode === 'function') setTimeTravelMode(true);
      break;
    case 'nataleMagico':
      if (typeof setNataleMagicoMode === 'function') setNataleMagicoMode(true);
      break;
    case 'compleannoSpeciale':
      if (typeof setCompleannoSpecialeMode === 'function') setCompleannoSpecialeMode(true);
      break;
  }
  return true;
};

// Funzione per gestire le transazioni con priorità
export const handleTransactionEasterEggs = (amount, date, setters) => {
  const transactionDate = new Date(date);
  const isTimeTravelDate = transactionDate.getFullYear() === 1999 && 
                          transactionDate.getMonth() === 11 && 
                          transactionDate.getDate() === 31;
  
  const isNataleDate = transactionDate.getMonth() === 11 && 
                      transactionDate.getDate() === 25;
  
  const isCompleannoDate = transactionDate.getMonth() === 5 && 
                          transactionDate.getDate() === 5;
  
  // Se è una data di time travel, attiva solo quello (priorità più alta)
  if (isTimeTravelDate) {
    activateEasterEgg('timeTravel', setters);
    return 'timeTravel';
  }
  
  // Se è Natale, attiva l'effetto natalizio
  if (isNataleDate) {
    activateEasterEgg('nataleMagico', setters);
    return 'nataleMagico';
  }
  
  // Se è compleanno, attiva l'effetto compleanno
  if (isCompleannoDate) {
    activateEasterEgg('compleannoSpeciale', setters);
    return 'compleannoSpeciale';
  }
  
  // Altrimenti controlla gli altri easter egg
  if (parseFloat(amount) === 888) {
    activateEasterEgg('entrataAngelica', setters);
    return 'entrataAngelica';
  }
  
  if (parseFloat(amount) === 666) {
    activateEasterEgg('uscitaDiabolica', setters);
    return 'uscitaDiabolica';
  }
  
  if (parseFloat(amount) === 777) {
    activateEasterEgg('quadrifoglioFortunato', setters);
    return 'quadrifoglioFortunato';
  }
  
  return null;
};

// Funzione per salvare un easter egg completato nel database
export const saveEasterEggCompletion = async (easterEggId, setEasterEggCompleted) => {
  try {
    await setEasterEggCompleted(easterEggId);
    
    return true;
  } catch (error) {
    console.error('Errore nel salvataggio easter egg:', error);
    return false;
  }
};

// Funzione per verificare se un easter egg è completato
export const checkEasterEggCompletion = async (easterEggId, isEasterEggCompleted) => {
  try {
    return await isEasterEggCompleted(easterEggId);
  } catch (error) {
    console.error('Errore nel controllo easter egg:', error);
    return false;
  }
};

// Funzione per ottenere tutti gli easter egg con stato di completamento
export const getEasterEggsWithCompletionStatus = async (getCompletedEasterEggs) => {
  try {
    const completed = await getCompletedEasterEggs();
    return getAllEasterEggs().map(egg => ({
      ...egg,
      isCompleted: completed.includes(egg.id)
    }));
  } catch (error) {
    console.error('Errore nel recupero stato easter egg:', error);
    return [];
  }
}; 