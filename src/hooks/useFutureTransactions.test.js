import { renderHook, act } from '@testing-library/react';
import { useFutureTransactions } from './useFutureTransactions';

// Mock useFirestore
const mockUpdateDocument = jest.fn();
const mockDeleteDocument = jest.fn();

jest.mock('./useFirestore', () => ({
  useFirestore: () => ({
    updateDocument: mockUpdateDocument,
    deleteDocument: mockDeleteDocument
  })
}));

describe('useFutureTransactions', () => {
  beforeEach(() => {
    // Reset mocks
    mockUpdateDocument.mockClear();
    mockDeleteDocument.mockClear();
  });

  describe('moveToCurrent', () => {
    it('sposta correttamente una spesa futura a oggi', async () => {
      const { result } = renderHook(() => useFutureTransactions());
      
      const futureExpense = {
        id: 'exp-1',
        _type: 'expense',
        date: '2023-06-20T18:00:00',
        amount: 50,
        description: 'Spesa futura'
      };

      // Mock successful update
      mockUpdateDocument.mockResolvedValue(true);

      await act(async () => {
        await result.current.moveToCurrent(futureExpense);
      });

      expect(mockUpdateDocument).toHaveBeenCalledTimes(1);
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'expenses', 
        'exp-1', 
        expect.objectContaining({
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
      );
    });

    it('sposta correttamente un\'entrata futura a oggi', async () => {
      const { result } = renderHook(() => useFutureTransactions());
      
      const futureIncome = {
        id: 'inc-1',
        _type: 'income',
        date: '2023-06-20T18:00:00',
        amount: 100,
        description: 'Entrata futura'
      };

      // Mock successful update
      mockUpdateDocument.mockResolvedValue(true);

      await act(async () => {
        await result.current.moveToCurrent(futureIncome);
      });

      expect(mockUpdateDocument).toHaveBeenCalledTimes(1);
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'incomes', 
        'inc-1', 
        expect.objectContaining({
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
      );
    });

    it('gestisce correttamente errori durante lo spostamento', async () => {
      const { result } = renderHook(() => useFutureTransactions());
      
      const futureExpense = {
        id: 'exp-1',
        _type: 'expense',
        date: '2023-06-20T18:00:00',
        amount: 50,
        description: 'Spesa futura'
      };

      // Mock failed update
      mockUpdateDocument.mockRejectedValue(new Error('Errore database'));

      await act(async () => {
        await expect(result.current.moveToCurrent(futureExpense)).rejects.toThrow('Errore database');
      });

      expect(mockUpdateDocument).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkAndMoveExpiredTransactions', () => {
    it('gestisce correttamente array vuoti', async () => {
      const { result } = renderHook(() => useFutureTransactions());

      await act(async () => {
        const moveResult = await result.current.checkAndMoveExpiredTransactions([], []);
        expect(moveResult.movedExpenses).toBe(0);
        expect(moveResult.movedIncomes).toBe(0);
      });

      expect(mockUpdateDocument).toHaveBeenCalledTimes(0);
    });

    it('restituisce la struttura corretta del risultato', async () => {
      const { result } = renderHook(() => useFutureTransactions());

      await act(async () => {
        const moveResult = await result.current.checkAndMoveExpiredTransactions([], []);
        expect(moveResult).toHaveProperty('movedExpenses');
        expect(moveResult).toHaveProperty('movedIncomes');
        expect(typeof moveResult.movedExpenses).toBe('number');
        expect(typeof moveResult.movedIncomes).toBe('number');
      });
    });
  });
});
