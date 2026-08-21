# SGS To Do List — guida alla pubblicazione

App per il team, con task condivisi in tempo reale. I dati sono salvati su un
database Supabase: restano memorizzati anche se tutti chiudono il browser, e
ogni persona vede gli stessi task aggiornati istantaneamente.

Tempo stimato: **20–30 minuti**, nessuna esperienza di programmazione richiesta
oltre a copiare/incollare.

---

## Parte 1 — Crea il database (Supabase)

1. Vai su **[supabase.com](https://supabase.com)** → *Start your project* → crea un account gratuito.
2. Clicca **New project**:
   - Dai un nome (es. `sgs-todolist`)
   - Crea una password per il database (salvala da parte, non serve nel codice ma è utile tenerla)
   - Scegli la regione più vicina (es. Europe/Frankfurt)
   - Clicca **Create new project** e aspetta 1-2 minuti che venga creato.
3. Nel menu a sinistra vai su **SQL Editor** → **New query**.
4. Apri il file `supabase-schema.sql` incluso in questo pacchetto, copia **tutto** il contenuto, incollalo nell'editor e clicca **Run**.
   - Questo crea la tabella `tasks` e le regole di accesso per il team.
5. Vai su **Project Settings** (icona ingranaggio) → **API**. Ti servono due valori, tienili a portata di mano per la Parte 3:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public key** (una chiave lunga)

### Crea gli utenti del team

6. Nel menu a sinistra vai su **Authentication** → **Users** → **Add user** → **Create new user**.
7. Inserisci l'email e una password per ogni persona del team che deve accedere. Ripeti per ognuno.
   - Non serve conferma email: l'utente può accedere subito con email e password che hai impostato.
   - Puoi aggiungere o rimuovere persone in qualsiasi momento da qui.

---

## Parte 2 — Prova l'app in locale (facoltativo ma consigliato)

Se hai [Node.js](https://nodejs.org) installato sul computer:

```bash
cd sgs-todolist
npm install
cp .env.example .env
```

Apri il file `.env` appena creato e incolla i valori del tuo progetto Supabase (Project URL e anon key presi al punto 5):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxx
```

Poi avvia:

```bash
npm run dev
```

Apri il link che appare nel terminale (es. `http://localhost:5173`) e prova ad accedere con uno degli utenti creati al punto 7.

Se non vuoi installare nulla sul computer, puoi saltare questa parte e passare direttamente alla pubblicazione online: Vercel farà la build al posto tuo.

---

## Parte 3 — Pubblica l'app online (Vercel)

1. Crea un account gratuito su **[github.com](https://github.com)** se non ce l'hai già.
2. Crea un nuovo repository (es. `sgs-todolist`), pubblico o privato.
3. Carica tutti i file di questo pacchetto nel repository:
   - Più semplice: dalla pagina del repository su GitHub, clicca **Add file → Upload files** e trascina tutti i file e le cartelle (compresa `src`).
   - Non serve caricare `node_modules` (non esiste ancora) né il file `.env` (contiene dati privati: resta solo sul tuo computer/su Vercel, mai su GitHub).
4. Vai su **[vercel.com](https://vercel.com)** → crea un account gratuito, collegandolo al tuo account GitHub.
5. Clicca **Add New → Project**, seleziona il repository `sgs-todolist` appena creato → **Import**.
6. Prima di cliccare *Deploy*, apri **Environment Variables** e aggiungi le stesse due variabili del file `.env`:
   - `VITE_SUPABASE_URL` → il tuo Project URL
   - `VITE_SUPABASE_ANON_KEY` → la tua anon key
7. Clicca **Deploy**. Dopo circa un minuto ottieni un link pubblico tipo:
   `https://sgs-todolist.vercel.app`

Quel link è quello da condividere con il team. Ogni persona apre il link, inserisce l'email e la password che hai creato in Supabase, ed entra nella lista condivisa.

---

## Come funziona da qui in poi

- **I task sono condivisi**: chiunque acceda vede la stessa lista, aggiornata in tempo reale.
- **Aggiungere/rimuovere persone**: Supabase → Authentication → Users.
- **Backup dei dati**: Supabase → Table Editor → tabella `tasks`, oppure esporta con Database → Backups.
- **Aggiornare il design o le funzioni in futuro**: modifica i file in `src/`, carica le modifiche su GitHub — Vercel ripubblica l'app automaticamente ad ogni aggiornamento.
- **Costi**: sia Supabase che Vercel hanno un piano gratuito più che sufficiente per un team che usa una to-do list interna. Se in futuro il traffico crescesse molto, entrambi offrono piani a pagamento.

---

## Struttura del progetto

```
sgs-todolist/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── supabase-schema.sql      ← da eseguire su Supabase (Parte 1)
├── .env.example              ← modello per le tue chiavi (Parte 2)
└── src/
    ├── main.jsx
    ├── App.jsx                ← tutta l'interfaccia dell'app
    ├── supabaseClient.js       ← connessione al database
    ├── index.css
    └── assets/
        └── logo-sgs.png
```
