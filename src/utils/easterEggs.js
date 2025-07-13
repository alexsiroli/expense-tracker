// Configurazione centralizzata per tutti gli easter egg
export const easterEggs = {
  tapSegreto: {
    id: 'tapSegreto',
    title: 'Tap Segreto',
    description: 'Tap 5 volte rapidamente sul logo del portafoglio per attivare il tema arcobaleno',
    activationMessage: '🎉 Tema arcobaleno attivato! 🌈 Ora tutto è più colorato e divertente!',
    hasDeactivationMessage: false,
    priority: 1 // Priorità più bassa
  },
  tapLungo: {
    id: 'tapLungo',
    title: 'Tap Lungo',
    description: 'Tieni premuto per 3 secondi sul titolo dell\'app per attivare la modalità party',
    activationMessage: '🎊 PARTY MODE ATTIVATA! 🎉 Ora tutto balla e brilla!',
    hasDeactivationMessage: false,
    priority: 2
  },
  temaSegreto: {
    id: 'temaSegreto',
    title: 'Tema Segreto',
    description: 'Doppio tap sul footer per attivare il tema retro pixel art',
    activationMessage: '🕹️ Tema retro attivato! 🎮 Benvenuto negli anni \'80!',
    hasDeactivationMessage: false,
    priority: 3
  },
  uscitaDiabolica: {
    id: 'uscitaDiabolica',
    title: 'Uscita Diabolica',
    description: 'Aggiungi una spesa di 666€ per attivare l\'effetto fiamme',
    activationMessage: '🔥 USCITA DIABOLICA ATTIVATA! 🔥 Il tile ora brucia con le fiamme dell\'inferno!',
    hasDeactivationMessage: false,
    priority: 4
  },
  entrataAngelica: {
    id: 'entrataAngelica',
    title: 'Entrata Angelica',
    description: 'Aggiungi un\'entrata di 888€ per attivare l\'effetto angelico',
    activationMessage: '👼 Entrata angelica rilevata! ✨ Effetto divino applicato!',
    hasDeactivationMessage: false,
    priority: 5
  },
  timeTravel: {
    id: 'timeTravel',
    title: 'Time Travel',
    description: 'Crea una transazione datata 31/12/1999 per attivare l\'effetto glitch',
    activationMessage: '🌌 Time travel rilevato! ⚡ Effetto glitch applicato!',
    hasDeactivationMessage: false,
    priority: 6 // Priorità più alta - sovrascrive tutti gli altri
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
    setTimeTravelMode
  } = setters;
  
  setRainbowMode(false);
  setPartyMode(false);
  setRetroMode(false);
  setFlameMode(false);
  setAngelicMode(false);
  setTimeTravelMode(false);
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
    setTimeTravelMode
  } = setters;
  
  // Disattiva tutti gli easter egg prima
  deactivateAllEasterEggs(setters);
  
  // Attiva solo quello specifico
  switch (id) {
    case 'tapSegreto':
      setRainbowMode(true);
      break;
    case 'tapLungo':
      setPartyMode(true);
      break;
    case 'temaSegreto':
      setRetroMode(true);
      break;
    case 'uscitaDiabolica':
      setFlameMode(true);
      break;
    case 'entrataAngelica':
      setAngelicMode(true);
      break;
    case 'timeTravel':
      setTimeTravelMode(true);
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
  
  // Se è una data di time travel, attiva solo quello (priorità più alta)
  if (isTimeTravelDate) {
    activateEasterEgg('timeTravel', setters);
    return 'timeTravel';
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
  
  return null;
}; 