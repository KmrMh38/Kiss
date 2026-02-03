/*
  # Création du schéma de l'application Quiz FCFA

  ## Description
  Cette migration crée la structure complète de la base de données pour l'application
  de quiz avec gains en FCFA destinée au public africain.

  ## 1. Nouvelles Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Référence auth.users
  - `pseudo` (text, unique, required) - Nom d'utilisateur affiché
  - `telephone` (text, unique, required) - Numéro de téléphone
  - `solde` (integer, default 0) - Solde en FCFA
  - `games_played_today` (integer, default 0) - Nombre de parties jouées aujourd'hui
  - `last_game_date` (date) - Date de la dernière partie
  - `created_at` (timestamptz) - Date de création
  
  ### `questions`
  - `id` (uuid, primary key) - Identifiant unique
  - `question` (text, required) - Texte de la question
  - `choix1` (text, required) - Premier choix de réponse
  - `choix2` (text, required) - Deuxième choix de réponse
  - `choix3` (text, required) - Troisième choix de réponse
  - `choix4` (text, required) - Quatrième choix de réponse
  - `bonne_reponse` (integer, required) - Index de la bonne réponse (1-4)
  - `created_at` (timestamptz) - Date de création
  
  ### `games`
  - `id` (uuid, primary key) - Identifiant unique
  - `user_id` (uuid, required) - Référence vers profiles
  - `score` (integer, required) - Nombre de bonnes réponses
  - `gain` (integer, required) - Gain en FCFA
  - `date` (timestamptz) - Date et heure de la partie
  
  ## 2. Sécurité (RLS)
  - RLS activé sur toutes les tables
  - Les utilisateurs peuvent voir et modifier uniquement leurs propres données
  - Les questions sont accessibles en lecture à tous les utilisateurs authentifiés
  - Les parties sont visibles uniquement par leur propriétaire
  
  ## 3. Fonctions
  - Fonction pour réinitialiser le compteur de parties quotidiennes
  - Trigger pour créer automatiquement un profil lors de l'inscription
*/

-- Créer la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo text UNIQUE NOT NULL,
  telephone text UNIQUE NOT NULL,
  solde integer DEFAULT 0 NOT NULL,
  games_played_today integer DEFAULT 0 NOT NULL,
  last_game_date date,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Créer la table questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  choix1 text NOT NULL,
  choix2 text NOT NULL,
  choix3 text NOT NULL,
  choix4 text NOT NULL,
  bonne_reponse integer NOT NULL CHECK (bonne_reponse >= 1 AND bonne_reponse <= 4),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Créer la table games
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  gain integer NOT NULL CHECK (gain >= 0),
  date timestamptz DEFAULT now() NOT NULL
);

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politiques RLS pour questions (lecture seule pour tous)
CREATE POLICY "Authenticated users can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Politiques RLS pour games
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour réinitialiser le compteur de parties quotidiennes
CREATE OR REPLACE FUNCTION reset_daily_games()
RETURNS trigger AS $$
BEGIN
  IF NEW.last_game_date IS NULL OR NEW.last_game_date < CURRENT_DATE THEN
    NEW.games_played_today := 0;
    NEW.last_game_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour réinitialiser automatiquement le compteur
DROP TRIGGER IF EXISTS reset_daily_games_trigger ON profiles;
CREATE TRIGGER reset_daily_games_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_games();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, pseudo, telephone, solde)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', 'User' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'telephone', NEW.phone),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_telephone ON profiles(telephone);
CREATE INDEX IF NOT EXISTS idx_profiles_pseudo ON profiles(pseudo);
