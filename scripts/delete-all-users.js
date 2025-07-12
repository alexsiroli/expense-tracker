const admin = require('firebase-admin');

// Inizializza Firebase Admin SDK
// Devi scaricare il file di configurazione del service account da Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deleteAllUsers() {
  try {
    console.log('Iniziando eliminazione di tutti gli utenti...');
    
    // Lista tutti gli utenti
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    if (users.length === 0) {
      console.log('Nessun utente trovato nel database.');
      return;
    }
    
    console.log(`Trovati ${users.length} utenti da eliminare.`);
    
    // Elimina tutti gli utenti
    const deletePromises = users.map(user => 
      admin.auth().deleteUser(user.uid)
    );
    
    await Promise.all(deletePromises);
    
    console.log(`Eliminati con successo ${users.length} utenti.`);
    
  } catch (error) {
    console.error('Errore durante l\'eliminazione degli utenti:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllUsers(); 