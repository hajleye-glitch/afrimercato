const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/db');
const { envoyerEmailConfirmation } = require('../utils/email');
require('dotenv').config();

// Inscription
const inscription = async (req, res) => {
  const client = await pool.connect();

  try {
    const { type_compte, nom, email, mot_de_passe, pays, region, telephone, date_naissance, poste_principal, pied_fort, taille } = req.body;

    // Validation
    if (!type_compte || !nom || !email || !mot_de_passe || !pays) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    if (type_compte !== 'joueur' && type_compte !== 'club') {
      return res.status(400).json({ message: 'Type de compte invalide' });
    }

    if (mot_de_passe.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    if (!/\d/.test(mot_de_passe)) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un chiffre' });
    }

    // Vérifier si l'email existe déjà
    const emailExiste = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Valider l'âge pour les joueurs
    if (type_compte === 'joueur') {
      if (!date_naissance) {
        return res.status(400).json({ message: 'La date de naissance est obligatoire pour les joueurs' });
      }
      const age = Math.floor((new Date() - new Date(date_naissance)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 13) {
        return res.status(400).json({ message: 'Vous devez avoir au moins 13 ans pour vous inscrire' });
      }
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, salt);

    // Générer le token d'email
    const email_token = uuidv4();
    const email_token_expiration = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await client.query('BEGIN');

    // Insérer l'utilisateur
    const userResult = await client.query(
      `INSERT INTO users (type, nom, email, mot_de_passe_hash, pays, region, telephone, email_token, email_token_expiration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [type_compte, nom, email, mot_de_passe_hash, pays, region || null, telephone || null, email_token, email_token_expiration]
    );

    const userId = userResult.rows[0].id;

    // Insérer dans la table spécifique
    if (type_compte === 'joueur') {
      await client.query(
        `INSERT INTO joueurs (user_id, date_naissance, poste_principal, pied_fort, taille)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, date_naissance, poste_principal || null, pied_fort || null, taille || null]
      );
    } else if (type_compte === 'club') {
      await client.query(
        `INSERT INTO clubs (user_id) VALUES ($1)`,
        [userId]
      );
    }

    await client.query('COMMIT');

    // Envoyer l'email de confirmation
    try {
      await envoyerEmailConfirmation(email, nom, email_token);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.status(201).json({
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
      userId,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
  } finally {
    client.release();
  }
};

// Connexion
const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (!user.email_token_expiration || user.email_token_expiration < new Date()) {
      if (user.email_token) {
        return res.status(403).json({ 
          message: 'Veuillez vérifier votre email avant de vous connecter',
          emailNonVerifie: true,
          email: user.email
        });
      }
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (user.statut === 'suspendu') {
      return res.status(403).json({ message: 'Votre compte a été suspendu. Contactez l\'administration.' });
    }

    const token = jwt.sign(
      { id: user.id, type: user.type, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        type: user.type,
        nom: user.nom,
        email: user.email,
        verifie: !user.email_token,
      },
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

// Confirmer l'email
const confirmerEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token requis' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email_token = $1',
      [token]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Lien invalide' });
    }

    if (user.email_token_expiration < new Date()) {
      return res.status(400).json({ message: 'Ce lien a expiré. Veuillez demander un nouveau lien.' });
    }

    await pool.query(
      'UPDATE users SET email_token = NULL, email_token_expiration = NULL WHERE id = $1',
      [user.id]
    );

    res.json({ message: 'Email confirmé avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (error) {
    console.error('Erreur confirmation:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation' });
  }
};

// Renvoyer l'email de confirmation
const renvoyerConfirmation = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' });
    }

    if (!user.email_token) {
      return res.status(400).json({ message: 'Ce compte est déjà vérifié' });
    }

    const email_token = uuidv4();
    const email_token_expiration = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET email_token = $1, email_token_expiration = $2 WHERE id = $3',
      [email_token, email_token_expiration, user.id]
    );

    await envoyerEmailConfirmation(email, user.nom, email_token);

    res.json({ message: 'Email de confirmation renvoyé avec succès' });
  } catch (error) {
    console.error('Erreur renvoi confirmation:', error);
    res.status(500).json({ message: 'Erreur lors du renvoi de l\'email' });
  }
};

// Obtenir le profil connecté
const getMoi = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, type, nom, email, pays, region, telephone, photo_profil, verifie, statut, date_inscription FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur getMoi:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { inscription, connexion, confirmerEmail, renvoyerConfirmation, getMoi };