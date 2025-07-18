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

    // Gestisci il risultato del redirect per dispositivi mobili
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect result received:', result.user);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        setError(getErrorMessage(error.code));
      }
    };

    handleRedirectResult();

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Tentativo di login con email:', email);
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login riuscito per utente:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('Errore durante il login:', error);
      console.error('Codice errore:', error.code);
      console.error('Messaggio errore:', error.message);
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const register = async (email, password, displayName) => {
    try {
      console.log('Tentativo di registrazione con email:', email);
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registrazione riuscita per utente:', result.user.email);
      
      // Aggiorna il profilo con il nome
      if (displayName) {
        console.log('Aggiornamento profilo con displayName:', displayName);
        await updateProfile(result.user, { displayName });
        console.log('Profilo aggiornato con successo');
      }
      
      return result.user;
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      console.error('Codice errore:', error.code);
      console.error('Messaggio errore:', error.message);
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Rileva se siamo su un dispositivo mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let result;
      
      if (isMobile) {
        // Su mobile, prova prima con popup, se fallisce usa redirect
        try {
          result = await signInWithPopup(auth, provider);
        } catch (popupError) {
          console.log('Popup failed on mobile, trying redirect...', popupError);
          // Se il popup fallisce, usa redirect
          await signInWithRedirect(auth, provider);
          // Il redirect gestirà il risultato automaticamente
          return null; // Il risultato verrà gestito da getRedirectResult
        }
      } else {
        // Su desktop, usa sempre popup
        result = await signInWithPopup(auth, provider);
      }
      
      console.log('Google login successful:', result?.user);
      return result?.user;
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
    console.log('Errore autenticazione Firebase:', errorCode);
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Utente non trovato. Verifica la tua email o registrati.';
      case 'auth/wrong-password':
        return 'Password errata. Verifica la password inserita.';
      case 'auth/email-already-in-use':
        return 'Email già registrata. Usa un\'altra email o accedi con quella esistente.';
      case 'auth/weak-password':
        return 'Password troppo debole. Usa almeno 6 caratteri.';
      case 'auth/invalid-email':
        return 'Email non valida. Inserisci un\'email corretta.';
      case 'auth/too-many-requests':
        return 'Troppi tentativi di accesso. Riprova più tardi.';
      case 'auth/operation-not-allowed':
        return 'Login con Google non abilitato. Contatta l\'amministratore.';
      case 'auth/popup-closed-by-user':
        return 'Login annullato. Riprova.';
      case 'auth/popup-blocked':
        return 'Popup bloccato. Abilita i popup per questo sito.';
      case 'auth/requires-recent-login':
        return 'Per eliminare l\'account, devi effettuare nuovamente l\'accesso per motivi di sicurezza. Effettua il logout e riaccedi.';
      case 'auth/user-token-expired':
        return 'Sessione scaduta. Effettua nuovamente l\'accesso.';
      case 'auth/missing-or-invalid-nonce':
        return 'Errore di sicurezza. Ricarica la pagina e riprova.';
      case 'auth/account-exists-with-different-credential':
        return 'Account già esistente con credenziali diverse.';
      case 'auth/network-request-failed':
        return 'Errore di connessione. Verifica la tua connessione internet.';
      case 'auth/internal-error':
        return 'Errore interno del server. Riprova più tardi.';
      default:
        return `Errore durante l'autenticazione (${errorCode}). Riprova o contatta il supporto.`;
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