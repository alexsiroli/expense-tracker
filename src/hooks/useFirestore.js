import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';

export const useFirestore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funzione per ottenere il riferimento alla collezione dell'utente
  const getUserCollection = (collectionName) => {
    if (!user) {
      console.error('Utente non autenticato');
      throw new Error('Utente non autenticato');
    }
    return collection(db, 'users', user.uid, collectionName);
  };

  // Carica dati in tempo reale
  const useCollectionData = (collectionName, orderByField = 'date') => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user) {
        setData([]);
        setLoading(false);
        return;
      }

      console.log(`Setting up listener for collection: ${collectionName}`);
      console.log(`User: ${user.uid}`);

      let q;
      if (orderByField) {
        q = query(
          getUserCollection(collectionName),
          orderBy(orderByField, 'desc')
        );
      } else {
        q = query(getUserCollection(collectionName));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`Snapshot received for ${collectionName}:`, snapshot.docs.length, 'documents');
        console.log(`Snapshot metadata:`, snapshot.metadata);
        console.log(`Snapshot empty:`, snapshot.empty);
        
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`Processed ${collectionName} data:`, items);
        console.log(`Setting data for ${collectionName}:`, items);
        setData(items);
        setLoading(false);
      }, (error) => {
        console.error(`Errore nel caricamento dati per ${collectionName}:`, error);
        console.error(`Error code:`, error.code);
        console.error(`Error message:`, error.message);
        console.error(`Collection name:`, collectionName);
        console.error(`Order by field:`, orderByField);
        setLoading(false);
      });

      return unsubscribe;
    }, [user, collectionName, orderByField]);

    return { data, loading };
  };

  // Aggiungi documento
  const addDocument = async (collectionName, document, forceUpdateStoresState) => {
    try {
      setLoading(true);
      setError(null);
      const collectionRef = getUserCollection(collectionName);
      const docRef = doc(collectionRef);
      // Log per debug
      console.log('addDocument chiamato con:', { collectionName, document });
      console.log('User:', user);
      console.log('User UID:', user.uid);
      console.log('User collection reference:', collectionRef);
      // Salva il documento
      await setDoc(docRef, { ...document, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      console.log('Document data to save:', { ...document, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      console.log('Document created successfully:', docRef);
      console.log('Document ID:', docRef.id);
      // Se è una spesa o entrata e contiene un nuovo negozio, aggiorna la lista negozi
      if ((collectionName === 'expenses' || collectionName === 'incomes') && document.store && document.store.trim()) {
        await sanitizeStores(forceUpdateStoresState);
      }
    } catch (error) {
      setError('Errore durante l\'aggiunta: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna documento
  const updateDocument = async (collectionName, documentId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, 'users', user.uid, collectionName, documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      setError('Errore durante l\'aggiornamento: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Elimina documento
  const deleteDocument = async (collectionName, documentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, 'users', user.uid, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      setError('Errore durante l\'eliminazione: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Elimina più documenti in batch
  const deleteMultipleDocuments = async (collectionName, documentIds) => {
    try {
      setLoading(true);
      setError(null);
      
      const batch = writeBatch(db);
      
      documentIds.forEach(id => {
        const docRef = doc(db, 'users', user.uid, collectionName, id);
        batch.delete(docRef);
      });
      
      await batch.commit();
    } catch (error) {
      setError('Errore durante l\'eliminazione multipla: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Carica tutti i dati dell'utente (per backup/restore)
  const loadAllUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const collections = ['expenses', 'incomes', 'categories', 'stores', 'wallets'];
      const data = {};
      
      for (const collectionName of collections) {
        const querySnapshot = await getDocs(getUserCollection(collectionName));
        data[collectionName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      return data;
    } catch (error) {
      setError('Errore durante il caricamento dati: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Importa dati (per backup/restore)
  const importUserData = async (data, forceUpdateStoresState) => {
    try {
      setLoading(true);
      setError(null);
      
      const batch = writeBatch(db);
      
      // Estrai tutti i nomi dei negozi dalle spese e entrate importate
      const extractedStores = new Set();
      
      // Estrai negozi dalle spese
      if (data.expenses) {
        data.expenses.forEach(expense => {
          if (expense.store && expense.store.trim()) {
            extractedStores.add(expense.store.trim());
          }
        });
      }
      
      // Estrai negozi dalle entrate
      if (data.incomes) {
        data.incomes.forEach(income => {
          if (income.store && income.store.trim()) {
            extractedStores.add(income.store.trim());
          }
        });
      }
      
      // Importa expenses
      if (data.expenses) {
        data.expenses.forEach(expense => {
          const docRef = doc(getUserCollection('expenses'));
          batch.set(docRef, { ...expense, createdAt: new Date().toISOString() });
        });
      }
      
      // Importa incomes
      if (data.incomes) {
        data.incomes.forEach(income => {
          const docRef = doc(getUserCollection('incomes'));
          batch.set(docRef, { ...income, createdAt: new Date().toISOString() });
        });
      }
      
      // Importa categories
      if (data.categories) {
        const categoriesRef = doc(getUserCollection('categories'), 'default');
        batch.set(categoriesRef, data.categories);
      }
      
      // Importa stores - combina quelli esistenti con quelli estratti dalle transazioni
      let finalStores = [];
      
      // Aggiungi i negozi dal JSON se presenti
      if (data.stores && Array.isArray(data.stores)) {
        finalStores = [...data.stores];
      }
      
      // Aggiungi i negozi estratti dalle transazioni
      extractedStores.forEach(store => {
        if (!finalStores.includes(store)) {
          finalStores.push(store);
        }
      });
      
      // Salva la lista finale dei negozi
      if (finalStores.length > 0) {
        const storesRef = doc(getUserCollection('stores'), 'default');
        batch.set(storesRef, { stores: finalStores });
      }
      
      // Importa wallets
      if (data.wallets) {
        data.wallets.forEach(wallet => {
          const docRef = doc(getUserCollection('wallets'));
          batch.set(docRef, { ...wallet, createdAt: new Date().toISOString() });
        });
      }
      
      await batch.commit();
      
      console.log('Importazione completata. Negozi estratti:', Array.from(extractedStores));
      console.log('Lista finale negozi:', finalStores);
      // Sanifica i negozi dopo l'import
      await sanitizeStores(forceUpdateStoresState);
    } catch (error) {
      setError('Errore durante l\'importazione: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Elimina tutti i dati dell'utente
  const deleteAllUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const collections = ['expenses', 'incomes', 'categories', 'stores', 'wallets'];
      
      for (const collectionName of collections) {
        const querySnapshot = await getDocs(getUserCollection(collectionName));
        const batch = writeBatch(db);
        
        querySnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
    } catch (error) {
      setError('Errore durante l\'eliminazione di tutti i dati: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Gestione Easter Eggs completati
  const getCompletedEasterEggs = async () => {
    try {
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        return userSnapshot.data().completedEasterEggs || [];
      }
      return [];
    } catch (error) {
      console.error('Errore nel recupero easter egg completati:', error);
      return [];
    }
  };

  const setEasterEggCompleted = async (easterEggId) => {
    try {
      setLoading(true);
      setError(null);
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      let completedEasterEggs = [];
      if (userSnapshot.exists()) {
        completedEasterEggs = userSnapshot.data().completedEasterEggs || [];
      }
      if (!completedEasterEggs.includes(easterEggId)) {
        completedEasterEggs.push(easterEggId);
        // Usa setDoc con merge:true per creare il documento se non esiste
        await setDoc(userDoc, {
          completedEasterEggs,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      setError('Errore nel salvataggio easter egg: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isEasterEggCompleted = async (easterEggId) => {
    try {
      const completedEasterEggs = await getCompletedEasterEggs();
      return completedEasterEggs.includes(easterEggId);
    } catch (error) {
      console.error('Errore nel controllo easter egg:', error);
      return false;
    }
  };

  // Funzione per sanificare la lista dei negozi: assicura che tutti i negozi usati in expenses/incomes siano presenti in stores
  const sanitizeStores = async (forceUpdateStoresState) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[sanitizeStores] Avvio sanificazione negozi...');
      // Carica tutte le spese e entrate
      const expensesSnap = await getDocs(getUserCollection('expenses'));
      const incomesSnap = await getDocs(getUserCollection('incomes'));
      const storesSet = new Set();
      console.log('[sanitizeStores] Numero spese trovate:', expensesSnap.docs.length);
      expensesSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.store && data.store.trim()) {
          storesSet.add(data.store.trim());
          console.log('[sanitizeStores] Trovato negozio in expense:', data.store.trim());
        }
      });
      console.log('[sanitizeStores] Numero entrate trovate:', incomesSnap.docs.length);
      incomesSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.store && data.store.trim()) {
          storesSet.add(data.store.trim());
          console.log('[sanitizeStores] Trovato negozio in income:', data.store.trim());
        }
      });
      const finalStores = Array.from(storesSet);
      console.log('[sanitizeStores] Lista finale negozi da salvare:', finalStores);
      // Salva la lista finale su Firestore (anche se vuota)
      const storesRef = doc(getUserCollection('stores'), 'default');
      await setDoc(storesRef, { stores: finalStores });
      console.log('[sanitizeStores] Negozi aggiornati su Firestore!', finalStores);
      if (typeof forceUpdateStoresState === 'function') forceUpdateStoresState(finalStores);
    } catch (error) {
      setError('Errore durante la sanificazione negozi: ' + error.message);
      console.error('[sanitizeStores] Errore:', error);
      throw error;
    } finally {
      setLoading(false);
      console.log('[sanitizeStores] Fine sanificazione negozi.');
    }
  };

  return {
    loading,
    error,
    useCollectionData,
    addDocument,
    updateDocument,
    deleteDocument,
    deleteMultipleDocuments,
    loadAllUserData,
    importUserData,
    deleteAllUserData,
    getCompletedEasterEggs,
    setEasterEggCompleted,
    isEasterEggCompleted,
    sanitizeStores,
    clearError: () => setError(null)
  };
}; 