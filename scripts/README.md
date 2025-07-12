# Script per eliminare tutti gli utenti Firebase

Questo script elimina tutti gli utenti dal database di autenticazione Firebase.

## ⚠️ ATTENZIONE
Questa operazione è **IRREVERSIBILE** e eliminerà tutti gli account utente dal database.

## Passi per eseguire lo script:

### 1. Scarica le credenziali del service account
1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il tuo progetto "expense-tracker"
3. Vai su **Project Settings** (⚙️ icona ingranaggio)
4. Clicca su **Service accounts**
5. Clicca su **Generate new private key**
6. Salva il file JSON scaricato come `firebase-service-account.json` nella cartella `scripts/`

### 2. Installa le dipendenze
```bash
cd scripts
npm install
```

### 3. Esegui lo script
```bash
npm run delete-users
```

## Risultato
Lo script eliminerà tutti gli utenti dal database Firebase Authentication. Gli utenti dovranno registrarsi di nuovo per accedere all'app.

## Note
- I dati Firestore rimarranno, ma non saranno più associati agli account eliminati
- Dopo l'esecuzione, rimuovi il file `firebase-service-account.json` per sicurezza 