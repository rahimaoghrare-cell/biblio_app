const express = require('express');
const router  = express.Router();
const { dashboard, topLivres, topUsers, empruntParMois, parGenre } = require('../controllers/statsController');
const { verifierToken, verifierAdmin } = require('../middleware/auth');

// Toutes les stats sont protégées — admin seulement
router.use(verifierToken, verifierAdmin);

// GET /api/stats/dashboard          → vue générale
router.get('/dashboard',         dashboard);

// GET /api/stats/top-livres         → livres les plus empruntés
router.get('/top-livres',        topLivres);

// GET /api/stats/top-users          → utilisateurs les plus actifs
router.get('/top-users',         topUsers);

// GET /api/stats/emprunts-par-mois  → évolution mensuelle
router.get('/emprunts-par-mois', empruntParMois);

// GET /api/stats/par-genre          → emprunts par genre de livre
router.get('/par-genre',         parGenre);

module.exports = router;