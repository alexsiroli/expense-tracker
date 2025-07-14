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