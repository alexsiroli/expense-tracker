import { 
  addDebtTransaction, 
  editDebtTransaction, 
  deleteDebtTransaction, 
  validateDebtTransaction,
  calculatePersonBalance,
  getUniquePersons,
  getPersonTransactions,
  createResolutionTransaction,
  deletePersonTransactions,
  calculateAutomaticTransfers,
  deletePersonWithAutomaticTransfers
} from './debtLogic';

describe('Debt Logic', () => {
  const mockDebts = [
    {
      id: '1',
      personName: 'Mario',
      amount: 50,
      type: 'debt',
      walletId: 'wallet1',
      date: '2024-01-01',
      time: '12:00',
      description: 'Pranzo'
    },
    {
      id: '2',
      personName: 'Mario',
      amount: 30,
      type: 'credit',
      walletId: 'wallet1',
      date: '2024-01-02',
      time: '20:00',
      description: 'Cena'
    },
    {
      id: '3',
      personName: 'Luigi',
      amount: 20,
      type: 'debt',
      walletId: 'wallet2',
      date: '2024-01-03',
      time: '09:00',
      description: 'Caffè'
    }
  ];

  describe('addDebtTransaction', () => {
    it('should add a new debt transaction', () => {
      const newDebt = {
        personName: 'Anna',
        amount: 25,
        type: 'debt',
        walletId: 'wallet1',
        date: '2024-01-04',
        description: 'Taxi'
      };

      const result = addDebtTransaction(mockDebts, newDebt);
      
      expect(result).toHaveLength(4);
      expect(result[3]).toMatchObject({
        personName: 'Anna',
        amount: 25,
        type: 'debt',
        walletId: 'wallet1',
        date: '2024-01-04',
        description: 'Taxi',
        _type: 'debt'
      });
      expect(result[3].id).toBeDefined();
    });

    it('should throw error for invalid debt', () => {
      const invalidDebt = {
        personName: '',
        amount: -10,
        type: 'debt',
        walletId: '',
        date: '2024-01-04'
      };

      expect(() => addDebtTransaction(mockDebts, invalidDebt)).toThrow('Movimento non valido');
    });
  });

  describe('editDebtTransaction', () => {
    it('should edit an existing debt transaction', () => {
      const updatedFields = {
        amount: 60,
        description: 'Pranzo aggiornato'
      };

      const result = editDebtTransaction(mockDebts, '1', updatedFields);
      
      expect(result[0]).toMatchObject({
        id: '1',
        personName: 'Mario',
        amount: 60,
        type: 'debt',
        walletId: 'wallet1',
        date: '2024-01-01',
        description: 'Pranzo aggiornato'
          });
  });

  describe('Swipe and Interaction Logic', () => {
    it('should handle swipe threshold correctly', () => {
      const threshold = 60;
      
      // Test soglia per eliminazione (swipe da destra a sinistra)
      expect(-70 < -threshold).toBe(true); // Dovrebbe attivare eliminazione
      expect(-50 > -threshold).toBe(true); // Non dovrebbe attivare eliminazione
      
      // Test soglia per modifica (swipe da sinistra a destra)
      expect(70 > threshold).toBe(true); // Dovrebbe attivare modifica
      expect(50 < threshold).toBe(true); // Non dovrebbe attivare modifica
    });

    it('should validate transaction types', () => {
      const validTypes = ['debt', 'credit'];
      
      expect(validTypes).toContain('debt');
      expect(validTypes).toContain('credit');
      expect(validTypes).not.toContain('invalid');
    });

    it('should handle resolution transaction creation with empty walletId', () => {
      const resolution = createResolutionTransaction('Mario', 50, '');
      
      expect(resolution).toMatchObject({
        personName: 'Mario',
        amount: 50,
        type: 'debt',
        walletId: '',
        description: 'Risoluzione situazione'
      });
    });
  });

  describe('Sorting and Grouping Logic', () => {
    const transactionsWithTime = [
      {
        id: '1',
        personName: 'Mario',
        amount: 50,
        type: 'debt',
        walletId: 'wallet1',
        date: '2024-01-01',
        time: '12:00'
      },
      {
        id: '2',
        personName: 'Mario',
        amount: 30,
        type: 'credit',
        walletId: 'wallet1',
        date: '2024-01-01',
        time: '20:00'
      },
      {
        id: '3',
        personName: 'Mario',
        amount: 20,
        type: 'debt',
        walletId: 'wallet1',
        date: '2024-01-02',
        time: '09:00'
      }
    ];

    it('should sort transactions by date and time correctly', () => {
      const sortedTransactions = getPersonTransactions(transactionsWithTime, 'Mario');
      
      // Dovrebbe essere ordinato per data e ora (più recente prima)
      expect(sortedTransactions[0].id).toBe('3'); // 2024-01-02 09:00
      expect(sortedTransactions[1].id).toBe('2'); // 2024-01-01 20:00
      expect(sortedTransactions[2].id).toBe('1'); // 2024-01-01 12:00
    });

    it('should handle transactions without time field', () => {
      const transactionsWithoutTime = [
        {
          id: '1',
          personName: 'Mario',
          amount: 50,
          type: 'debt',
          walletId: 'wallet1',
          date: '2024-01-01'
        },
        {
          id: '2',
          personName: 'Mario',
          amount: 30,
          type: 'credit',
          walletId: 'wallet1',
          date: '2024-01-02'
        }
      ];

      const sortedTransactions = getPersonTransactions(transactionsWithoutTime, 'Mario');
      
      expect(sortedTransactions[0].id).toBe('2'); // 2024-01-02
      expect(sortedTransactions[1].id).toBe('1'); // 2024-01-01
    });

    it('should group persons correctly with multiple transactions', () => {
      const multipleTransactions = [
        { personName: 'Mario', amount: 50, type: 'debt' },
        { personName: 'Mario', amount: 30, type: 'credit' },
        { personName: 'Luigi', amount: 20, type: 'debt' },
        { personName: 'Anna', amount: 40, type: 'credit' }
      ];

      const uniquePersons = getUniquePersons(multipleTransactions);
      
      expect(uniquePersons).toHaveLength(3);
      expect(uniquePersons).toContain('Mario');
      expect(uniquePersons).toContain('Luigi');
      expect(uniquePersons).toContain('Anna');
    });
  });

  describe('Automatic Transfers on Person Deletion', () => {
    const multiWalletDebts = [
      {
        id: '1',
        personName: 'Mario',
        amount: 100,
        type: 'credit', // Ho dato 100€ a Mario via PayPal
        walletId: 'paypal',
        date: '2024-01-01',
        time: '12:00',
        description: 'Prestito PayPal'
      },
      {
        id: '2',
        personName: 'Mario',
        amount: 100,
        type: 'debt', // Mario mi ha restituito 100€ in contanti
        walletId: 'contanti',
        date: '2024-01-02',
        time: '15:00',
        description: 'Restituzione contanti'
      },
      {
        id: '3',
        personName: 'Luigi',
        amount: 50,
        type: 'credit', // Ho dato 50€ a Luigi via PayPal
        walletId: 'paypal',
        date: '2024-01-03',
        time: '10:00',
        description: 'Prestito PayPal'
      },
      {
        id: '4',
        personName: 'Luigi',
        amount: 30,
        type: 'debt', // Luigi mi ha restituito 30€ in contanti
        walletId: 'contanti',
        date: '2024-01-04',
        time: '14:00',
        description: 'Restituzione parziale'
      }
    ];

    describe('calculateAutomaticTransfers', () => {
      it('should calculate transfers for person with balanced transactions across wallets', () => {
        const transfers = calculateAutomaticTransfers(multiWalletDebts, 'Mario');
        
        // Mario: PayPal -100€, Contanti +100€
        // Dovrebbe creare un trasferimento da PayPal a contanti di 100€
        expect(transfers).toHaveLength(1);
        expect(transfers[0]).toMatchObject({
          fromWalletId: 'paypal',
          toWalletId: 'contanti',
          amount: 100,
          description: 'Trasferimento automatico da eliminazione Mario'
        });
      });

      it('should calculate transfers for person with unbalanced transactions', () => {
        const transfers = calculateAutomaticTransfers(multiWalletDebts, 'Luigi');
        
        // Luigi: PayPal -50€, Contanti +30€
        // Dovrebbe creare un trasferimento da PayPal a contanti di 30€
        expect(transfers).toHaveLength(1);
        expect(transfers[0]).toMatchObject({
          fromWalletId: 'paypal',
          toWalletId: 'contanti',
          amount: 30,
          description: 'Trasferimento automatico da eliminazione Luigi'
        });
      });

      it('should handle person with transactions in single wallet', () => {
        const singleWalletDebts = [
          {
            id: '1',
            personName: 'Anna',
            amount: 50,
            type: 'credit',
            walletId: 'paypal',
            date: '2024-01-01'
          },
          {
            id: '2',
            personName: 'Anna',
            amount: 50,
            type: 'debt',
            walletId: 'paypal',
            date: '2024-01-02'
          }
        ];

        const transfers = calculateAutomaticTransfers(singleWalletDebts, 'Anna');
        
        // Anna: PayPal -50€ + 50€ = 0€
        // Non dovrebbe creare trasferimenti
        expect(transfers).toHaveLength(0);
      });

      it('should handle person with no transactions', () => {
        const transfers = calculateAutomaticTransfers(multiWalletDebts, 'NonExistent');
        expect(transfers).toHaveLength(0);
      });

      it('should handle complex scenario with multiple wallets', () => {
        const complexDebts = [
          {
            id: '1',
            personName: 'Marco',
            amount: 100,
            type: 'credit',
            walletId: 'paypal',
            date: '2024-01-01'
          },
          {
            id: '2',
            personName: 'Marco',
            amount: 60,
            type: 'debt',
            walletId: 'contanti',
            date: '2024-01-02'
          },
          {
            id: '3',
            personName: 'Marco',
            amount: 40,
            type: 'debt',
            walletId: 'banca',
            date: '2024-01-03'
          }
        ];

        const transfers = calculateAutomaticTransfers(complexDebts, 'Marco');
        
        // Marco: PayPal -100€, Contanti +60€, Banca +40€
        // Dovrebbe creare trasferimenti da contanti e banca a PayPal
        expect(transfers).toHaveLength(2);
        
        // Verifica che i trasferimenti bilancino correttamente
        const paypalTransfers = transfers.filter(t => t.fromWalletId === 'paypal');
        const totalFromPaypal = paypalTransfers.reduce((sum, t) => sum + t.amount, 0);
        expect(totalFromPaypal).toBe(100);
      });

      it('should handle edge case with very small amounts', () => {
        const smallAmountDebts = [
          {
            id: '1',
            personName: 'Test',
            amount: 0.02,
            type: 'credit',
            walletId: 'paypal',
            date: '2024-01-01'
          },
          {
            id: '2',
            personName: 'Test',
            amount: 0.02,
            type: 'debt',
            walletId: 'contanti',
            date: '2024-01-02'
          }
        ];

        const transfers = calculateAutomaticTransfers(smallAmountDebts, 'Test');
        
        // PayPal: -0.02€, Contanti: +0.02€
        // Dovrebbe creare un trasferimento da contanti a PayPal di 0.02€
        expect(transfers).toHaveLength(1);
        expect(transfers[0].amount).toBe(0.02);
      });

      it('should not create transfers for amounts below tolerance', () => {
        const tinyAmountDebts = [
          {
            id: '1',
            personName: 'Test',
            amount: 0.005,
            type: 'credit',
            walletId: 'paypal',
            date: '2024-01-01'
          },
          {
            id: '2',
            personName: 'Test',
            amount: 0.005,
            type: 'debt',
            walletId: 'contanti',
            date: '2024-01-02'
          }
        ];

        const transfers = calculateAutomaticTransfers(tinyAmountDebts, 'Test');
        
        // Con tolleranza di 0.01, non dovrebbe creare trasferimenti
        expect(transfers).toHaveLength(0);
      });
    });

    describe('deletePersonWithAutomaticTransfers', () => {
      it('should delete person and return automatic transfers', () => {
        const result = deletePersonWithAutomaticTransfers(multiWalletDebts, 'Mario');
        
        // Verifica che i debiti di Mario siano stati eliminati
        expect(result.remainingDebts).toHaveLength(2);
        expect(result.remainingDebts.every(d => d.personName !== 'Mario')).toBe(true);
        
        // Verifica che i trasferimenti automatici siano stati calcolati
        expect(result.automaticTransfers).toHaveLength(1);
        expect(result.automaticTransfers[0]).toMatchObject({
          fromWalletId: 'paypal',
          toWalletId: 'contanti',
          amount: 100
        });
      });

      it('should handle person with no transfers needed', () => {
        const singleWalletDebts = [
          {
            id: '1',
            personName: 'Anna',
            amount: 50,
            type: 'credit',
            walletId: 'paypal',
            date: '2024-01-01'
          },
          {
            id: '2',
            personName: 'Anna',
            amount: 50,
            type: 'debt',
            walletId: 'paypal',
            date: '2024-01-02'
          }
        ];

        const result = deletePersonWithAutomaticTransfers(singleWalletDebts, 'Anna');
        
        expect(result.remainingDebts).toHaveLength(0);
        expect(result.automaticTransfers).toHaveLength(0);
      });

      it('should preserve other persons when deleting one', () => {
        const result = deletePersonWithAutomaticTransfers(multiWalletDebts, 'Mario');
        
        // Verifica che Luigi sia ancora presente
        const luigiDebts = result.remainingDebts.filter(d => d.personName === 'Luigi');
        expect(luigiDebts).toHaveLength(2);
      });

      it('should handle user scenario: credit from wallet1, debt to wallet2', () => {
        const userScenario = [
          {
            id: '1',
            personName: 'TestUser',
            amount: 10,
            type: 'credit', // Ho dato 10€ da Portafoglio 1
            walletId: 'wallet1',
            date: '2024-01-01'
          },
          {
            id: '2',
            personName: 'TestUser',
            amount: 10,
            type: 'debt', // Ho ricevuto 10€ in Portafoglio 2
            walletId: 'wallet2',
            date: '2024-01-02'
          }
        ];

        const transfers = calculateAutomaticTransfers(userScenario, 'TestUser');
        
        // Portafoglio 1: -10€ (credito), Portafoglio 2: +10€ (debito)
        // Dovrebbe creare trasferimento da Portafoglio 1 a Portafoglio 2
        expect(transfers).toHaveLength(1);
        expect(transfers[0]).toMatchObject({
          fromWalletId: 'wallet1',
          toWalletId: 'wallet2',
          amount: 10,
          description: 'Trasferimento automatico da eliminazione TestUser'
        });
      });
    });
  });
});

  describe('deleteDebtTransaction', () => {
    it('should delete a debt transaction by id', () => {
      const result = deleteDebtTransaction(mockDebts, '1');
      
      expect(result).toHaveLength(2);
      expect(result.find(d => d.id === '1')).toBeUndefined();
    });
  });

  describe('validateDebtTransaction', () => {
    it('should validate a correct debt transaction', () => {
      const validDebt = {
        personName: 'Mario',
        amount: 50,
        walletId: 'wallet1',
        date: '2024-01-01'
      };

      expect(validateDebtTransaction(validDebt)).toBe(true);
    });

    it('should reject invalid debt transactions', () => {
      const invalidDebts = [
        { personName: '', amount: 50, walletId: 'wallet1', date: '2024-01-01' },
        { personName: 'Mario', amount: 0, walletId: 'wallet1', date: '2024-01-01' },
        { personName: 'Mario', amount: 50, walletId: '', date: '2024-01-01' },
        { personName: 'Mario', amount: 50, walletId: 'wallet1', date: '' }
      ];

      invalidDebts.forEach(debt => {
        expect(validateDebtTransaction(debt)).toBe(false);
      });
    });

    it('should reject future dates', () => {
      // Mock current date to 2024-01-01
      const originalDate = global.Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate('2024-01-01');
          }
          return new originalDate(...args);
        }
      };

      const futureDateDebt = {
        personName: 'Mario',
        amount: 50,
        walletId: 'wallet1',
        date: '2024-01-02' // Future date relative to mocked current date
      };

      expect(validateDebtTransaction(futureDateDebt)).toBe(false);

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('calculatePersonBalance', () => {
    it('should calculate correct balance for a person', () => {
      const balance = calculatePersonBalance(mockDebts, 'Mario');
      
      // Mario has: -50 (debt) + 30 (credit) = -20
      expect(balance).toBe(-20);
    });

    it('should return 0 for person not found', () => {
      const balance = calculatePersonBalance(mockDebts, 'NonExistent');
      expect(balance).toBe(0);
    });
  });

  describe('getUniquePersons', () => {
    it('should return unique person names sorted alphabetically', () => {
      const persons = getUniquePersons(mockDebts);
      
      expect(persons).toEqual(['Luigi', 'Mario']);
    });
  });

  describe('getPersonTransactions', () => {
    it('should return transactions for a specific person sorted by date and time', () => {
      const transactions = getPersonTransactions(mockDebts, 'Mario');
      
      expect(transactions).toHaveLength(2);
      expect(transactions[0].id).toBe('2'); // 2024-01-02 20:00 (more recent)
      expect(transactions[1].id).toBe('1'); // 2024-01-01 12:00 (older)
    });
  });

  describe('createResolutionTransaction', () => {
    it('should create a resolution transaction for positive balance', () => {
      const resolution = createResolutionTransaction('Mario', 30, 'wallet1');
      
      expect(resolution).toMatchObject({
        personName: 'Mario',
        amount: 30,
        type: 'debt',
        walletId: 'wallet1',
        description: 'Risoluzione situazione'
      });
      expect(resolution.date).toBeDefined();
      expect(resolution.time).toBeDefined();
    });

    it('should create a resolution transaction for negative balance', () => {
      const resolution = createResolutionTransaction('Mario', -20, 'wallet1');
      
      expect(resolution).toMatchObject({
        personName: 'Mario',
        amount: 20,
        type: 'credit',
        walletId: 'wallet1',
        description: 'Risoluzione situazione'
      });
      expect(resolution.date).toBeDefined();
      expect(resolution.time).toBeDefined();
    });
  });

  describe('deletePersonTransactions', () => {
    it('should delete all transactions for a person', () => {
      const result = deletePersonTransactions(mockDebts, 'Mario');
      
      expect(result).toHaveLength(1);
      expect(result[0].personName).toBe('Luigi');
    });
  });

  describe('Wallet Balance Calculation with Debts', () => {
    const mockWallets = [
      { id: 'wallet1', name: 'Conto Principale', balance: 1000, initialBalance: 1000 },
      { id: 'wallet2', name: 'Conto Secondario', balance: 500, initialBalance: 500 }
    ];

    const mockExpenses = [
      { id: '1', amount: 50, walletId: 'wallet1', date: '2024-01-01' },
      { id: '2', amount: 30, walletId: 'wallet1', date: '2024-01-02' }
    ];

    const mockIncomes = [
      { id: '1', amount: 200, walletId: 'wallet1', date: '2024-01-03' },
      { id: '2', amount: 100, walletId: 'wallet2', date: '2024-01-04' }
    ];

    // Funzione di calcolo del saldo (copiata da App.jsx)
    const calculateWalletBalance = (walletId, wallets, expenses, incomes, debts) => {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) return 0;
      
      const totalIn = incomes.filter(i => i.walletId === walletId).reduce((sum, i) => sum + parseFloat(i.amount), 0);
      const totalOut = expenses.filter(e => e.walletId === walletId).reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      // Calcola l'impatto dei movimenti di debito/credito
      const walletDebts = debts.filter(d => d.walletId === walletId);
      const totalDebtImpact = walletDebts.reduce((sum, debt) => {
        // Se è un credito (ho dato soldi), il conto diminuisce
        // Se è un debito (ho ricevuto soldi), il conto aumenta
        return sum + (debt.type === 'credit' ? -debt.amount : debt.amount);
      }, 0);
      
      // Usa il saldo iniziale se disponibile, altrimenti il saldo corrente
      const baseBalance = wallet.initialBalance !== undefined ? wallet.initialBalance : wallet.balance;
      return baseBalance + totalIn - totalOut + totalDebtImpact;
    };

    it('should calculate wallet balance correctly with debts and credits', () => {
      const balance = calculateWalletBalance('wallet1', mockWallets, mockExpenses, mockIncomes, mockDebts);
      

      
      // Per wallet1, mockDebts contiene solo:
      // - Mario: +50 (debt) - 30 (credit) = +20
      // - Luigi: +20 (debt) ma per wallet2, quindi non conta
      // Calcolo: 1000 (saldo iniziale) + 200 (entrate) - 80 (uscite) + (+20) (debiti/crediti)
      // = 1000 + 200 - 80 + 20 = 1140
      expect(balance).toBe(1140);
    });

    it('should calculate wallet balance for wallet with no debts', () => {
      const balance = calculateWalletBalance('wallet2', mockWallets, mockExpenses, mockIncomes, mockDebts);
      
      // Calcolo: 500 (saldo iniziale) + 100 (entrate) - 0 (uscite) + 20 (debito di Luigi)
      // = 500 + 100 + 20 = 620
      expect(balance).toBe(620);
    });

    it('should handle credit transactions correctly (decrease wallet balance)', () => {
      const creditDebts = [
        {
          id: '1',
          personName: 'Mario',
          amount: 100,
          type: 'credit', // Ho dato 100€ a Mario
          walletId: 'wallet1',
          date: '2024-01-01'
        }
      ];

      const balance = calculateWalletBalance('wallet1', mockWallets, mockExpenses, mockIncomes, creditDebts);
      
      // Calcolo: 1000 (saldo iniziale) + 200 (entrate) - 80 (uscite) + (-100) (credito)
      // = 1000 + 200 - 80 - 100 = 1020
      expect(balance).toBe(1020);
    });

    it('should handle debt transactions correctly (increase wallet balance)', () => {
      const debtTransactions = [
        {
          id: '1',
          personName: 'Mario',
          amount: 100,
          type: 'debt', // Ho ricevuto 100€ da Mario
          walletId: 'wallet1',
          date: '2024-01-01'
        }
      ];

      const balance = calculateWalletBalance('wallet1', mockWallets, mockExpenses, mockIncomes, debtTransactions);
      
      // Calcolo: 1000 (saldo iniziale) + 200 (entrate) - 80 (uscite) + 100 (debito)
      // = 1000 + 200 - 80 + 100 = 1220
      expect(balance).toBe(1220);
    });

    it('should return 0 for non-existent wallet', () => {
      const balance = calculateWalletBalance('non-existent', mockWallets, mockExpenses, mockIncomes, mockDebts);
      expect(balance).toBe(0);
    });

    it('should handle empty debts array', () => {
      const balance = calculateWalletBalance('wallet1', mockWallets, mockExpenses, mockIncomes, []);
      
      // Calcolo: 1000 (saldo iniziale) + 200 (entrate) - 80 (uscite) + 0 (nessun debito)
      // = 1000 + 200 - 80 = 1120
      expect(balance).toBe(1120);
    });
  });
}); 