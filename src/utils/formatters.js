// Funzione helper per formattare i numeri con apostrofo per le migliaia
export const formatCurrency = (amount) => {
  return `€${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
};

// Funzione per formattare solo il numero senza simbolo euro
export const formatNumber = (amount) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}; 