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
  getRedirectResult
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
      
      // Su mobile usa redirect, su desktop usa popup
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      }
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Gestisce il risultato del redirect (per mobile)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Login con Google completato
          console.log('Google login successful:', result.user);
        }
      } catch (error) {
        setError(getErrorMessage(error.code));
      }
    };

    handleRedirectResult();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
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
      default:
        return 'Errore durante l\'autenticazione. Riprova.';
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
    clearError: () => setError(null)
  };
}; 