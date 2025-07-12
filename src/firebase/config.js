import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDigO-IbSyJB8q-xvU1mHsTPrqm7Sne6xU",
  authDomain: "money-tracker-6c88c.firebaseapp.com",
  projectId: "money-tracker-6c88c",
  storageBucket: "money-tracker-6c88c.firebasestorage.app",
  messagingSenderId: "66841048485",
  appId: "1:66841048485:web:db403f1dd5d0abdfad644c"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta auth e firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 