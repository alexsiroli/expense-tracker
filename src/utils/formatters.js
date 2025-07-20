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
 * Ottiene la data corrente in formato YYYY-MM-DD nel fuso orario locale
 * @returns {string} Data nel formato YYYY-MM-DD
 */
export function getCurrentLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ottiene l'ora corrente in formato HH:MM nel fuso orario locale
 * @returns {string} Ora nel formato HH:MM
 */
export function getCurrentLocalTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Converte una data in formato YYYY-MM-DD nel fuso orario locale
 * @param {string} dateString - Data in formato YYYY-MM-DD
 * @returns {Date} Oggetto Date nel fuso orario locale
 */
export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Confronta due date ignorando l'ora (solo data)
 * @param {Date} date1 - Prima data
 * @param {Date} date2 - Seconda data
 * @returns {number} -1 se date1 < date2, 0 se uguali, 1 se date1 > date2
 */
export function compareDatesOnly(date1, date2) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() - d2.getTime();
} 