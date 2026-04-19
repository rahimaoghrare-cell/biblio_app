const express = require('express');
const router  = express.Router();
const {
  creerEmprunt,
  retournerLivre,
  payerPenalite,
  getEmpruntsEnRetard,
  getAllEmprunts,
} = require('../controllers/empruntController');

// GET  /api/emprunts              → tous les emprunts (filtre: ?statut=en_retard&utilisateur=id)
router.get('/',            getAllEmprunts);

// GET  /api/emprunts/retards      → emprunts en retard avec pénalités recalculées
router.get('/retards',     getEmpruntsEnRetard);

// POST /api/emprunts              → créer un emprunt
router.post('/',           creerEmprunt);

// PUT  /api/emprunts/:id/retour   → retourner un livre (calcule pénalité)
router.put('/:id/retour',  retournerLivre);

// PUT  /api/emprunts/:id/payer    → marquer la pénalité comme payée
router.put('/:id/payer',   payerPenalite);

module.exports = router;
