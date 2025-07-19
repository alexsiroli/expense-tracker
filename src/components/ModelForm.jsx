import ExpenseForm from './ExpenseForm';

function ModelForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  type, 
  categories, 
  stores, 
  editingModel = null,
  wallets = [],
  selectedWalletId
}) {

  return (
    <ExpenseForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      type={type}
      editingItem={editingModel}
      stores={stores}
      categories={categories}
      wallets={wallets}
      selectedWalletId={selectedWalletId}
      isModelMode={true}
    />
  );
}

export default ModelForm; 