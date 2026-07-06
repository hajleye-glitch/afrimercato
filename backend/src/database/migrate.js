const pool = require('./db');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('joueur', 'club')),
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mot_de_passe_hash VARCHAR(255) NOT NULL,
        pays VARCHAR(100),
        region VARCHAR(255),
        telephone VARCHAR(30),
        photo_profil VARCHAR(500),
        photo_couverture VARCHAR(500),
        description TEXT,
        verifie BOOLEAN DEFAULT FALSE,
        email_token VARCHAR(255),
        email_token_expiration TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu')),
        date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table joueurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS joueurs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        date_naissance DATE,
        poste_principal VARCHAR(100),
        pied_fort VARCHAR(20) CHECK (pied_fort IN ('Droit', 'Gauche', 'Les deux')),
        taille INTEGER,
        poids INTEGER,
        disponibilite VARCHAR(50) DEFAULT 'À définir'
      );
    `);

    // Table clubs
    await client.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        date_creation DATE,
        niveau VARCHAR(100),
        site_web VARCHAR(255)
      );
    `);

    // Index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
      CREATE INDEX IF NOT EXISTS idx_users_pays ON users(pays);
    `);

    await client.query('COMMIT');
    console.log('✅ Tables créées avec succès');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

createTables();