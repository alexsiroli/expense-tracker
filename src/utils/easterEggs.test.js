import {
  getEasterEgg,
  getAllEasterEggs,
  getEasterEggTitles,
  deactivateAllEasterEggs,
  activateEasterEgg,
  handleTransactionEasterEggs,
  saveEasterEggCompletion,
  checkEasterEggCompletion,
  getEasterEggsWithCompletionStatus
} from './easterEggs';

describe('easterEggs utils', () => {
  it('getEasterEgg restituisce un easter egg valido', () => {
    const egg = getEasterEgg('tapSegreto');
    expect(egg).toBeTruthy();
    expect(egg.id).toBe('tapSegreto');
  });

  it('getEasterEgg restituisce null per id sconosciuto', () => {
    expect(getEasterEgg('nonEsiste')).toBeNull();
  });

  it('getAllEasterEggs restituisce una lista non vuota', () => {
    const eggs = getAllEasterEggs();
    expect(Array.isArray(eggs)).toBe(true);
    expect(eggs.length).toBeGreaterThan(0);
  });

  it('getEasterEggTitles restituisce solo titoli', () => {
    const titles = getEasterEggTitles();
    expect(Array.isArray(titles)).toBe(true);
    expect(titles[0]).toEqual(expect.any(String));
  });

  it('deactivateAllEasterEggs chiama tutti i setter a false', () => {
    const setters = {
      setRainbowMode: jest.fn(),
      setPartyMode: jest.fn(),
      setRetroMode: jest.fn(),
      setFlameMode: jest.fn(),
      setAngelicMode: jest.fn(),
      setTimeTravelMode: jest.fn(),
      setNataleMagicoMode: jest.fn(),
      setCompleannoSpecialeMode: jest.fn(),
    };
    deactivateAllEasterEggs(setters);
    Object.values(setters).forEach(fn => {
      expect(fn).toHaveBeenCalledWith(false);
    });
  });

  it('activateEasterEgg attiva solo il setter giusto', () => {
    const setters = {
      setRainbowMode: jest.fn(),
      setPartyMode: jest.fn(),
      setRetroMode: jest.fn(),
      setFlameMode: jest.fn(),
      setAngelicMode: jest.fn(),
      setTimeTravelMode: jest.fn(),
      setNataleMagicoMode: jest.fn(),
      setCompleannoSpecialeMode: jest.fn(),
    };
    activateEasterEgg('tapSegreto', setters);
    expect(setters.setRainbowMode).toHaveBeenCalledWith(true);
    Object.entries(setters).forEach(([key, fn]) => {
      if (key !== 'setRainbowMode') expect(fn).not.toHaveBeenCalledWith(true);
    });
  });

  it('handleTransactionEasterEggs attiva easter egg in base a data e importo', () => {
    const setters = {
      setRainbowMode: jest.fn(),
      setPartyMode: jest.fn(),
      setRetroMode: jest.fn(),
      setFlameMode: jest.fn(),
      setAngelicMode: jest.fn(),
      setTimeTravelMode: jest.fn(),
      setNataleMagicoMode: jest.fn(),
      setCompleannoSpecialeMode: jest.fn(),
    };
    // Time travel
    expect(handleTransactionEasterEggs(100, '1999-12-31', setters)).toBe('timeTravel');
    // Natale
    expect(handleTransactionEasterEggs(100, '2023-12-25', setters)).toBe('nataleMagico');
    // Compleanno
    expect(handleTransactionEasterEggs(100, '2023-06-05', setters)).toBe('compleannoSpeciale');
    // Angelica
    expect(handleTransactionEasterEggs(888, '2023-01-01', setters)).toBe('entrataAngelica');
    // Diabolica
    expect(handleTransactionEasterEggs(666, '2023-01-01', setters)).toBe('uscitaDiabolica');
    // Quadrifoglio
    expect(handleTransactionEasterEggs(777, '2023-01-01', setters)).toBe('quadrifoglioFortunato');
    // Nessun easter egg
    expect(handleTransactionEasterEggs(10, '2023-01-01', setters)).toBeNull();
  });
});

describe('easterEggs utils - advanced/edge cases', () => {
  it('activateEasterEgg ritorna false per id non valido', () => {
    const setters = { setRainbowMode: jest.fn() };
    expect(activateEasterEgg('nonEsiste', setters)).toBe(false);
  });

  it('activateEasterEgg non lancia se i setter sono mancanti', () => {
    expect(() => activateEasterEgg('tapSegreto', {})).not.toThrow();
  });

  it('deactivateAllEasterEggs non lancia se i setter sono mancanti', () => {
    expect(() => deactivateAllEasterEggs({})).not.toThrow();
  });

  it('handleTransactionEasterEggs ritorna null per date/amount non validi', () => {
    const setters = { setRainbowMode: jest.fn() };
    expect(handleTransactionEasterEggs(undefined, undefined, setters)).toBeNull();
    expect(handleTransactionEasterEggs(null, null, setters)).toBeNull();
    expect(handleTransactionEasterEggs('abc', 'not-a-date', setters)).toBeNull();
  });

  it('saveEasterEggCompletion salva correttamente e gestisce errori', async () => {
    const setEasterEggCompleted = jest.fn().mockResolvedValue(true);
    await expect(saveEasterEggCompletion('tapSegreto', setEasterEggCompleted)).resolves.toBe(true);
    const setEasterEggCompletedErr = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(saveEasterEggCompletion('tapSegreto', setEasterEggCompletedErr)).resolves.toBe(false);
  });

  it('checkEasterEggCompletion ritorna true/false e gestisce errori', async () => {
    const isEasterEggCompleted = jest.fn().mockResolvedValue(true);
    await expect(checkEasterEggCompletion('tapSegreto', isEasterEggCompleted)).resolves.toBe(true);
    const isEasterEggCompletedErr = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(checkEasterEggCompletion('tapSegreto', isEasterEggCompletedErr)).resolves.toBe(false);
  });

  it('getEasterEggsWithCompletionStatus ritorna lista con status', async () => {
    const getCompletedEasterEggs = jest.fn().mockResolvedValue(['tapSegreto', 'nataleMagico']);
    const result = await getEasterEggsWithCompletionStatus(getCompletedEasterEggs);
    expect(Array.isArray(result)).toBe(true);
    expect(result.find(e => e.id === 'tapSegreto').completed).toBe(true);
    expect(result.find(e => e.id === 'tapLungo').completed).toBe(false);
  });

  it('getEasterEggsWithCompletionStatus gestisce errori', async () => {
    const getCompletedEasterEggs = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(getEasterEggsWithCompletionStatus(getCompletedEasterEggs)).resolves.toEqual([]);
  });

  it('getEasterEggTitles ritorna array vuoto se nessun easter egg', () => {
    jest.spyOn(Object, 'values').mockReturnValueOnce([]);
    expect(getEasterEggTitles()).toEqual([]);
  });
}); 