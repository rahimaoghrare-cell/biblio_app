const express = require('express');
const router  = express.Router();
const {
  creerLivre,
  getLivres,
  getLivreById,
  modifierLivre,
  supprimerLivre,
  rechercheAvancee,
  suggestions,
  getGenres,
} = require('../controllers/livreController');

// ⚠️  Les routes statiques (/recherche, /suggestions, /genres)
//     doivent être déclarées AVANT /:id pour éviter les conflits.

// GET  /api/livres/recherche?q=...&genre=...&disponible=...
router.get('/recherche',   rechercheAvancee);

// GET  /api/livres/suggestions?q=java   → autocomplete
router.get('/suggestions', suggestions);

// GET  /api/livres/genres               → liste des genres distincts
router.get('/genres',      getGenres);

// GET  /api/livres
router.get('/',            getLivres);

// GET  /api/livres/:id
router.get('/:id',         getLivreById);

// POST /api/livres
router.post('/',           creerLivre);

// PUT  /api/livres/:id
router.put('/:id',         modifierLivre);

// DELETE /api/livres/:id
router.delete('/:id',      supprimerLivre);

module.exports = router;