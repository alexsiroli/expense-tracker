# 🚀 Deployment su Netlify

## Configurazione Variabili d'Ambiente

Dopo aver connesso il repository a Netlify, configura queste variabili d'ambiente:

### **Netlify Dashboard → Site Settings → Environment Variables**

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=money-tracker-6c88c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=money-tracker-6c88c
VITE_FIREBASE_STORAGE_BUCKET=money-tracker-6c88c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=66841048485
VITE_FIREBASE_APP_ID=1:66841048485:web:db403f1dd5d0abdfad644c
```

## Passi per il Deployment

1. **Vai su [Netlify](https://netlify.com)**
2. **Clicca "New site from Git"**
3. **Connetti il repository GitHub**
4. **Configura le variabili d'ambiente** (vedi sopra)
5. **Deploy!**

## Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

## Domini

Netlify fornirà automaticamente un dominio come:
`https://your-app-name.netlify.app`

Puoi anche configurare un dominio personalizzato. 