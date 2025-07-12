import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  deleteUser
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const register = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Aggiorna il profilo con il nome
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Usa sempre popup per evitare problemi di redirect
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        throw new Error('Nessun utente autenticato');
      }
      
      // Elimina l'account utente
      await deleteUser(user);
      console.log('Account eliminato con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione account:', error);
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Utente non trovato. Verifica la tua email.';
      case 'auth/wrong-password':
        return 'Password errata. Riprova.';
      case 'auth/email-already-in-use':
        return 'Email già registrata. Usa un\'altra email o accedi.';
      case 'auth/weak-password':
        return 'Password troppo debole. Usa almeno 6 caratteri.';
      case 'auth/invalid-email':
        return 'Email non valida.';
      case 'auth/too-many-requests':
        return 'Troppi tentativi. Riprova più tardi.';
      case 'auth/operation-not-allowed':
        return 'Login con Google non abilitato. Abilitalo in Firebase Console.';
      case 'auth/popup-closed-by-user':
        return 'Login annullato. Riprova.';
      case 'auth/popup-blocked':
        return 'Popup bloccato. Abilita i popup per questo sito.';
      case 'auth/requires-recent-login':
        return 'Per eliminare l\'account, devi effettuare nuovamente l\'accesso.';
      case 'auth/user-token-expired':
        return 'Sessione scaduta. Effettua nuovamente l\'accesso.';
      default:
        return `Errore durante l'autenticazione: ${errorCode}. Riprova.`;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    deleteAccount,
    clearError: () => setError(null)
  };
}; 