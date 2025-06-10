-- Créer un schéma de base de données pour stocker les envois d'utilisateurs

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    age VARCHAR(10),
    gender VARCHAR(10),
    consent BOOLEAN NOT NULL DEFAULT FALSE,
    num_phrases INTEGER NOT NULL,
    zip_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des phrases associées à un utilisateur
CREATE TABLE IF NOT EXISTS phrases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phrase TEXT NOT NULL
);

-- Index pour améliorer les performances sur les colonnes utilisées fréquemment
CREATE INDEX IF NOT EXISTS idx_phrases_user_id ON phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
