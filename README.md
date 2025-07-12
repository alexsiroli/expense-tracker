# 📊 Tracker Spese - App per Gestione Finanze Personali

Un'applicazione web moderna e responsive per tracciare spese, entrate e visualizzare statistiche finanziarie. Progettata per l'utilizzo mobile con un'interfaccia intuitiva e grafici interattivi.

> **Sviluppato con ❤️ da [Alex Siroli](https://github.com/alexsiroli)**

## ✨ Funzionalità

### 💰 Gestione Finanze
- **Aggiunta Spese**: Registra spese con descrizione, importo, categoria e data
- **Aggiunta Entrate**: Traccia entrate da diverse fonti (stipendio, freelance, investimenti, ecc.)
- **Categorie Predefinite**: Sistema di categorie per organizzare le transazioni
- **Eliminazione**: Rimuovi facilmente spese e entrate non più necessarie

### 📈 Statistiche e Grafici
- **Bilancio Totale**: Visualizza il saldo complessivo (entrate - spese)
- **Grafici a Torta**: Distribuzione spese e entrate per categoria
- **Grafici a Barre**: Andamento mensile degli ultimi 6 mesi
- **Statistiche Mensili**: Confronto tra mese corrente e totale

### 📱 Design Responsive
- **Mobile-First**: Ottimizzato per smartphone e tablet
- **Interfaccia Intuitiva**: Navigazione a tab per facile accesso alle funzioni
- **Design Moderno**: UI pulita con Tailwind CSS e icone Lucide

### 💾 Persistenza Dati
- **Local Storage**: I dati vengono salvati automaticamente nel browser
- **Nessun Server**: Funziona completamente offline
- **Backup Automatico**: Salvataggio automatico ad ogni modifica

## 🚀 Demo Live

**🔗 [Visualizza Demo](https://expense-tracker-demo.netlify.app)**

![Demo Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Tracker+Spese+Demo)

## 🛠️ Tecnologie Utilizzate

- **React 19** - Framework JavaScript moderno
- **Vite** - Build tool veloce e moderno
- **Tailwind CSS** - Framework CSS utility-first
- **Recharts** - Libreria per grafici e statistiche
- **Lucide React** - Icone moderne e leggere
- **date-fns** - Gestione date e formattazione

## 📦 Installazione e Utilizzo

### Prerequisiti
- Node.js (versione 16 o superiore)
- npm o yarn
- Account Firebase (per autenticazione e database)

### Configurazione Firebase

1. **Crea un progetto Firebase**
   - Vai su [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuovo progetto
   - Abilita Authentication e Firestore

2. **Configura le variabili d'ambiente**
   - Crea un file `.env` nella root del progetto
   - Aggiungi le tue credenziali Firebase:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installazione

1. **Clona il repository**
```bash
git clone https://github.com/tuousername/expense-tracker.git
cd expense-tracker
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili d'ambiente**
   - Copia il file `.env.example` in `.env`
   - Inserisci le tue credenziali Firebase

4. **Avvia l'applicazione in modalità sviluppo**
```bash
npm run dev
```

5. **Apri il browser**
L'applicazione sarà disponibile all'indirizzo `http://localhost:5173`

### Build per Produzione

```bash
npm run build
```

I file di produzione saranno generati nella cartella `dist/`.

## 📱 Utilizzo

### Aggiungere una Spesa
1. Tocca il tab "Spese"
2. Tocca "Aggiungi"
3. Compila descrizione, importo, categoria e data
4. Tocca "Salva"

### Aggiungere un'Entrata
1. Tocca il tab "Entrate"
2. Tocca "Aggiungi"
3. Compila descrizione, importo, categoria e data
4. Tocca "Salva"

### Visualizzare Statistiche
1. Tocca il tab "Statistiche"
2. Esplora i grafici e le statistiche disponibili

### Eliminare una Transazione
1. Trova la transazione nella lista
2. Tocca l'icona del cestino
3. Conferma l'eliminazione

## 🎨 Categorie Disponibili

### Spese
- 🍽️ Alimentari
- 🚗 Trasporti
- 🎮 Intrattenimento
- 🛍️ Shopping
- 💡 Bollette
- 🏥 Salute
- 📚 Educazione
- 📦 Altro

### Entrate
- 💼 Stipendio
- 💻 Freelance
- 📈 Investimenti
- 🎁 Regali
- 🛒 Vendite
- 📦 Altro

## 📊 Funzionalità Statistiche

- **Bilancio Totale**: Calcolo automatico del saldo
- **Statistiche Mensili**: Confronto mese corrente vs totale
- **Grafici Interattivi**: Visualizzazione dati con tooltip
- **Distribuzione Categorie**: Analisi spese e entrate per categoria
- **Andamento Temporale**: Grafici degli ultimi 6 mesi

## 🔧 Personalizzazione

### Aggiungere Nuove Categorie
Modifica il file `src/components/ExpenseForm.jsx`:

```javascript
const categories = {
  expense: [
    'Alimentari',
    'Trasporti',
    // Aggiungi qui le tue categorie
    'Nuova Categoria'
  ],
  income: [
    'Stipendio',
    'Freelance',
    // Aggiungi qui le tue categorie
    'Nuova Entrata'
  ]
};
```

### Modificare i Colori
Personalizza i colori nel file `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color-here',
        // Altri colori...
      }
    }
  }
}
```

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto la licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## 🙏 Ringraziamenti

- [React](https://reactjs.org/) per il framework
- [Tailwind CSS](https://tailwindcss.com/) per lo styling
- [Recharts](https://recharts.org/) per i grafici
- [Lucide](https://lucide.dev/) per le icone
- [date-fns](https://date-fns.org/) per la gestione date

## 👨‍💻 Sviluppatore

**Alex Siroli** - Sviluppatore Full Stack

Questa web app è stata realizzata interamente da Alex Siroli, sviluppatore appassionato di tecnologie moderne e UX design.

- 🌐 [Portfolio](https://alexsiroli.dev)
- 💼 [LinkedIn](https://linkedin.com/in/alexsiroli)
- 🐙 [GitHub](https://github.com/alexsiroli)

## 📞 Supporto

Se hai domande o problemi:
- Apri una [Issue](https://github.com/alexsiroli/expense-tracker/issues)
- Contattami via email: alex@alexsiroli.dev

---

⭐ **Se ti piace questo progetto, lascia una stella!** ⭐
