const express = require('express');
const router  = express.Router();
const { inscrire, connecter, getProfil, getUsers } = require('../controllers/userController');
const { verifierToken, verifierAdmin } = require('../middleware/auth');

// POST /api/users/inscription  → créer un compte
router.post('/inscription', inscrire);

// POST /api/users/connexion    → se connecter, reçoit le token JWT
router.post('/connexion',   connecter);

// GET  /api/users/profil       → profil de l'utilisateur connecté (token requis)
router.get('/profil',        verifierToken, getProfil);

// GET  /api/users              → tous les users (admin seulement)
router.get('/',              verifierToken, verifierAdmin, getUsers);

module.exports = router;