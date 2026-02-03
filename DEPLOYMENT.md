# Guide de Déploiement - Quiz FCFA

## Prérequis

- Compte Supabase (déjà configuré)
- Compte sur une plateforme d'hébergement (Netlify, Vercel, ou Firebase)
- Node.js installé localement

## Étape 1: Vérification Locale

1. Cloner le projet
2. Installer les dépendances:
```bash
npm install
```

3. Vérifier que le build fonctionne:
```bash
npm run build
```

4. Tester en local:
```bash
npm run preview
```

## Étape 2: Configuration Supabase

La base de données est déjà configurée avec:
- ✅ Tables créées (profiles, questions, games)
- ✅ 50 questions insérées
- ✅ Row Level Security activé
- ✅ Triggers et fonctions créés

## Étape 3: Déploiement sur Netlify (Recommandé)

### 3.1 Via Interface Web

1. Aller sur https://netlify.com
2. Se connecter ou créer un compte
3. Cliquer sur "Add new site" > "Import an existing project"
4. Connecter le dépôt GitHub
5. Configurer les paramètres de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Ajouter les variables d'environnement:
   - `VITE_SUPABASE_URL`: https://vepiacalttcmqbynnhve.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: [clé présente dans .env]
7. Cliquer sur "Deploy site"

### 3.2 Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser
netlify init

# Déployer
netlify deploy --prod
```

## Étape 4: Déploiement sur Vercel

### 4.1 Via Interface Web

1. Aller sur https://vercel.com
2. Se connecter avec GitHub
3. Importer le projet
4. Configurer:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Ajouter les variables d'environnement
6. Déployer

### 4.2 Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

## Étape 5: Déploiement sur Firebase Hosting

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser
firebase init hosting

# Configurer:
# - Public directory: dist
# - Single-page app: No
# - Set up automatic builds: No

# Build
npm run build

# Déployer
firebase deploy --only hosting
```

## Étape 6: Configuration PWA

Une fois déployé, l'application sera automatiquement installable en tant que PWA sur Android:

1. Ouvrir l'URL de l'application dans Chrome mobile
2. Un popup "Ajouter à l'écran d'accueil" apparaîtra
3. Ou manuellement: Menu > Ajouter à l'écran d'accueil

## Étape 7: Tests Post-Déploiement

### 7.1 Tester l'inscription
1. Ouvrir l'application sur mobile
2. Créer un compte avec un numéro de téléphone
3. Vérifier que le profil est créé dans Supabase

### 7.2 Tester la connexion
1. Se déconnecter
2. Se reconnecter avec les mêmes identifiants

### 7.3 Tester le jeu
1. Cliquer sur "Jouer maintenant"
2. Répondre aux questions
3. Vérifier que le solde se met à jour
4. Vérifier l'historique des parties

### 7.4 Tester la limite quotidienne
1. Jouer 5 parties
2. Vérifier que le bouton "Jouer" est désactivé
3. Vérifier le message "Limite quotidienne atteinte"

## Étape 8: Personnalisation Domaine (Optionnel)

### Sur Netlify
1. Aller dans Site settings > Domain management
2. Ajouter un custom domain
3. Configurer les DNS selon les instructions

### Sur Vercel
1. Aller dans Project Settings > Domains
2. Ajouter un custom domain
3. Configurer les DNS

## Étape 9: Monitoring et Maintenance

### Supabase Dashboard
- Surveiller le nombre d'utilisateurs
- Vérifier les requêtes SQL
- Consulter les logs d'authentification

### Analytics (Optionnel)
Ajouter Google Analytics ou Plausible pour suivre:
- Nombre de visiteurs
- Parties jouées
- Taux de conversion inscription

## Dépannage

### Erreur: Questions non chargées
- Vérifier que les 50 questions sont bien dans la table `questions`
- Vérifier les politiques RLS

### Erreur: Connexion impossible
- Vérifier les variables d'environnement
- Vérifier que Supabase Authentication est activé

### PWA non installable
- Vérifier que le site est en HTTPS
- Vérifier le manifest.webmanifest
- Vérifier le service worker

## URLs Utiles

- Supabase Dashboard: https://supabase.com/dashboard
- Documentation Supabase: https://supabase.com/docs
- Documentation Vite: https://vitejs.dev
- Documentation PWA: https://vite-pwa-org.netlify.app

## Support

En cas de problème:
1. Vérifier les logs de build
2. Vérifier les logs Supabase
3. Tester en local d'abord
4. Consulter la documentation de la plateforme d'hébergement
