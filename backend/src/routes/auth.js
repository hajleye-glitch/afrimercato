const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authentification = require('../middleware/auth');

// Routes publiques
router.post('/inscription', authController.inscription);
router.post('/connexion', authController.connexion);
router.post('/confirmer-email', authController.confirmerEmail);
router.post('/renvoyer-confirmation', authController.renvoyerConfirmation);

// Routes protégées
router.get('/moi', authentification, authController.getMoi);

module.exports = router;