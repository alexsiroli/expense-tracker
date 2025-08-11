// Funzione helper per formattare i numeri con apostrofo per le migliaia
export const formatCurrency = (amount) => {
  if (!Number.isFinite(amount)) throw new TypeError('amount must be a finite number');
  return `€${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
};

// Funzione per formattare solo il numero senza simbolo euro
export const formatNumber = (amount) => {
  if (!Number.isFinite(amount)) throw new TypeError('amount must be a finite number');
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
};

/**
 * Ottiene la data corrente in formato YYYY-MM-DD nel fuso orario di Roma (Europe/Rome)
 * @returns {string} Data nel formato YYYY-MM-DD
 */
export function getCurrentLocalDate() {
  const now = new Date();
  // Converti in orario di Roma
  const romeTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
  const year = romeTime.getFullYear();
  const month = String(romeTime.getMonth() + 1).padStart(2, '0');
  const day = String(romeTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ottiene l'ora corrente in formato HH:MM nel fuso orario di Roma (Europe/Rome)
 * @returns {string} Ora nel formato HH:MM
 */
export function getCurrentLocalTime() {
  const now = new Date();
  // Converti in orario di Roma
  const romeTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
  const hours = String(romeTime.getHours()).padStart(2, '0');
  const minutes = String(romeTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Converte una data in formato YYYY-MM-DD nel fuso orario locale
 * @param {string} dateString - Data in formato YYYY-MM-DD
 * @returns {Date} Oggetto Date nel fuso orario locale
 */
export function parseLocalDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('dateString must be a non-empty string');
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('Invalid date format');
  }
  
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('Invalid date values');
  }
  
  return new Date(year, month - 1, day);
}

/**
 * Ottiene l'orario corrente nel fuso orario di Roma (Europe/Rome)
 * @returns {Date} Data e ora correnti di Roma
 */
export function getCurrentRomeTime() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
}

/**
 * Confronta due date ignorando l'ora (solo data)
 * @param {Date} date1 - Prima data
 * @param {Date} date2 - Seconda data
 * @returns {number} -1 se date1 < date2, 0 se uguali, 1 se date1 > date2
 */
export function compareDatesOnly(date1, date2) {
  if (!date1 || !date2) {
    throw new Error('Both dates must be valid Date objects');
  }
  
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  // Confronta solo la data, non l'ora
  if (d1.getFullYear() < d2.getFullYear()) return -1;
  if (d1.getFullYear() > d2.getFullYear()) return 1;
  
  if (d1.getMonth() < d2.getMonth()) return -1;
  if (d1.getMonth() > d2.getMonth()) return 1;
  
  if (d1.getDate() < d2.getDate()) return -1;
  if (d1.getDate() > d2.getDate()) return 1;
  
  return 0;
} 