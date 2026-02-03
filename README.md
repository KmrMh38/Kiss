#kiss
# Quiz FCFA - Application de Quiz avec Gains

Application web mobile (PWA) permettant de jouer à des quiz et de gagner des points en FCFA.

## Fonctionnalités

- Inscription et connexion par téléphone
- Système de quiz avec 10 questions par partie
- Timer de 20 secondes par question
- Gain de 10 FCFA par bonne réponse
- Limite de 5 parties par jour
- Tableau de bord avec solde et historique
- Application PWA installable sur Android

## Technologies

- **Frontend**: HTML, CSS, JavaScript pur
- **Backend**: Supabase (Authentication + Database)
- **Build**: Vite
- **PWA**: vite-plugin-pwa

## Installation

1. Installer les dépendances:
```bash
npm install
```

2. Configurer Supabase:
Les variables d'environnement sont déjà configurées dans le fichier `.env`

3. Lancer en développement:
```bash
npm run dev
```

4. Build pour production:
```bash
npm run build
```

## Structure du Projet

```
quiz-app-fcfa/
├── public/              # Fichiers statiques (icônes PWA)
├── src/
│   ├── css/
│   │   └── styles.css   # Styles CSS mobile-first
│   └── js/
│       ├── supabase.js  # Configuration Supabase
│       ├── login.js     # Logique de connexion
│       ├── signup.js    # Logique d'inscription
│       ├── dashboard.js # Logique du tableau de bord
│       └── quiz.js      # Logique du jeu de quiz
├── index.html           # Page de connexion
├── signup.html          # Page d'inscription
├── dashboard.html       # Tableau de bord utilisateur
├── quiz.html            # Page du jeu
└── vite.config.js       # Configuration Vite + PWA
```

## Base de Données

### Tables Supabase

1. **profiles**
   - id (uuid, référence auth.users)
   - pseudo (text, unique)
   - telephone (text, unique)
   - solde (integer)
   - games_played_today (integer)
   - last_game_date (date)

2. **questions**
   - id (uuid)
   - question (text)
   - choix1, choix2, choix3, choix4 (text)
   - bonne_reponse (integer, 1-4)

3. **games**
   - id (uuid)
   - user_id (uuid, référence profiles)
   - score (integer, 0-10)
   - gain (integer)
   - date (timestamptz)

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Validation côté serveur pour les limites de jeu
- Un compte par numéro de téléphone

## Déploiement

### Option 1: Netlify

1. Créer un compte sur Netlify
2. Connecter le dépôt GitHub
3. Configurer:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Ajouter les variables d'environnement depuis `.env`
5. Déployer

### Option 2: Vercel

1. Créer un compte sur Vercel
2. Importer le projet
3. Configurer:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Ajouter les variables d'environnement
5. Déployer

### Option 3: Firebase Hosting

1. Installer Firebase CLI: `npm install -g firebase-tools`
2. Initialiser: `firebase init hosting`
3. Build: `npm run build`
4. Déployer: `firebase deploy`

## Installation PWA sur Android

1. Ouvrir l'application dans Chrome mobile
2. Appuyer sur le menu (3 points)
3. Sélectionner "Ajouter à l'écran d'accueil"
4. L'application sera installée comme une app native

## Ajouter Plus de Questions

Pour ajouter des questions, exécuter ce SQL dans Supabase:

```sql
INSERT INTO questions (question, choix1, choix2, choix3, choix4, bonne_reponse) VALUES
('Votre question?', 'Choix 1', 'Choix 2', 'Choix 3', 'Choix 4', 2);
```

Note: `bonne_reponse` doit être un nombre entre 1 et 4.

## Personnalisation

### Modifier le gain par question

Dans `src/js/quiz.js`, ligne 18:
```javascript
const GAIN_PER_CORRECT_ANSWER = 10; // Changer cette valeur
```

### Modifier la limite de parties quotidiennes

Dans `src/js/dashboard.js` et `src/js/quiz.js`, remplacer `5` par votre limite.

### Modifier le temps par question

Dans `src/js/quiz.js`, ligne 92:
```javascript
timeLeft = 20; // Changer cette valeur en secondes
```

## Support

Pour toute question ou problème, créer une issue sur le dépôt GitHub.

## Licence

MIT
=======
# Kiss
C'est un site tout simplement pas touche !

