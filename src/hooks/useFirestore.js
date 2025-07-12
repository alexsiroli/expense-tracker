import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  writeBatch
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
  const addDocument = async (collectionName, document) => {
    console.log('addDocument chiamato con:', { collectionName, document });
    console.log('User:', user);
    console.log('User UID:', user?.uid);
    
    try {
      setLoading(true);
      setError(null);
      
      const userCollection = getUserCollection(collectionName);
      console.log('User collection reference:', userCollection);
      
      const docData = {
        ...document,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Document data to save:', docData);
      
      const docRef = await addDoc(userCollection, docData);
      console.log('Document created successfully:', docRef);
      console.log('Document ID:', docRef.id);
      
      return docRef;
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      console.error('Codice errore:', error.code);
      console.error('Messaggio errore:', error.message);
      console.error('Stack trace:', error.stack);
      
      if (error.code === 'permission-denied') {
        setError('Errore di permessi. Verifica le regole di sicurezza Firestore.');
      } else if (error.code === 'unavailable') {
        setError('Servizio non disponibile. Verifica la connessione.');
      } else {
        setError('Errore durante il salvataggio: ' + error.message);
      }
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
  const importUserData = async (data) => {
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
        
        if (querySnapshot.docs.length > 0) {
          const batch = writeBatch(db);
          
          querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
        }
      }
      
      console.log('Tutti i dati dell\'utente eliminati con successo');
    } catch (error) {
      setError('Errore durante l\'eliminazione dei dati: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
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
    clearError: () => setError(null)
  };
}; 