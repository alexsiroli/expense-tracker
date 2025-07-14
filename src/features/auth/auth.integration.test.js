// Mock semplice per la logica di autenticazione
function login({ email, password }, users, currentUser) {
  if (currentUser) throw new Error('Utente già loggato');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Credenziali non valide');
  return user;
}

function logout(currentUser) {
  if (!currentUser) throw new Error('Nessun utente loggato');
  return null;
}

describe('INTEGRAZIONE: Login/Logout', () => {
  const users = [
    { id: 1, email: 'test@example.com', password: 'password123' },
    { id: 2, email: 'foo@bar.com', password: 'foobar' }
  ];
  let currentUser;
  beforeEach(() => {
    currentUser = null;
  });

  it('Login con credenziali valide', () => {
    currentUser = login({ email: 'test@example.com', password: 'password123' }, users, currentUser);
    expect(currentUser).toBeDefined();
    expect(currentUser.email).toBe('test@example.com');
  });

  it('Login con credenziali non valide', () => {
    expect(() => login({ email: 'test@example.com', password: 'sbagliata' }, users, currentUser)).toThrow();
    expect(() => login({ email: 'non@esiste.com', password: 'password123' }, users, currentUser)).toThrow();
  });

  it('Login con utente già loggato', () => {
    currentUser = users[0];
    expect(() => login({ email: 'test@example.com', password: 'password123' }, users, currentUser)).toThrow();
  });

  it('Logout dopo login', () => {
    currentUser = users[1];
    currentUser = logout(currentUser);
    expect(currentUser).toBeNull();
  });

  it('Logout senza login', () => {
    expect(() => logout(currentUser)).toThrow();
  });
}); 