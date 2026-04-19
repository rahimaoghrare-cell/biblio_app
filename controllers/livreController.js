const Livre = require('../models/Livre');

// ─── CRUD de base ─────────────────────────────────────────────────────────────

exports.creerLivre = async (req, res) => {
  try {
    const livre = new Livre(req.body);
    await livre.save();
    res.status(201).json({ message: 'Livre créé', livre });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.getLivres = async (req, res) => {
  try {
    const livres = await Livre.find().sort({ createdAt: -1 });
    res.json({ total: livres.length, livres });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.getLivreById = async (req, res) => {
  try {
    const livre = await Livre.findById(req.params.id);
    if (!livre) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(livre);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.modifierLivre = async (req, res) => {
  try {
    const livre = await Livre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!livre) return res.status(404).json({ message: 'Livre introuvable' });
    res.json({ message: 'Livre mis à jour', livre });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.supprimerLivre = async (req, res) => {
  try {
    const livre = await Livre.findByIdAndDelete(req.params.id);
    if (!livre) return res.status(404).json({ message: 'Livre introuvable' });
    res.json({ message: 'Livre supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── RECHERCHE AVANCÉE ────────────────────────────────────────────────────────
//
// GET /api/livres/recherche?q=javascript&genre=informatique&disponible=true
//                          &anneeMin=2010&anneeMax=2023&page=1&limite=10
//
// Tous les paramètres sont optionnels et combinables.

exports.rechercheAvancee = async (req, res) => {
  try {
    const {
      q,            // recherche full-text (titre, auteur, description)
      genre,        // ex: 'informatique'
      disponible,   // 'true' ou 'false'
      anneeMin,     // ex: 2000
      anneeMax,     // ex: 2023
      auteur,       // recherche partielle sur auteur (regex)
      titre,        // recherche partielle sur titre  (regex)
      page  = 1,
      limite = 10,
    } = req.query;

    const filtre = {};
    let useTextSearch = false;

    // ── 1. Full-text ($text) sur titre + auteur + description ────────────────
    if (q) {
      filtre.$text = { $search: q };
      useTextSearch = true;
    }

    // ── 2. Regex sur titre (si pas de $text, pour éviter conflit) ───────────
    if (titre && !q) {
      filtre.titre = { $regex: titre, $options: 'i' };
    }

    // ── 3. Regex sur auteur ──────────────────────────────────────────────────
    if (auteur && !q) {
      filtre.auteur = { $regex: auteur, $options: 'i' };
    }

    // ── 4. Genre exact ───────────────────────────────────────────────────────
    if (genre) {
      filtre.genre = genre.toLowerCase();
    }

    // ── 5. Disponibilité ─────────────────────────────────────────────────────
    if (disponible !== undefined) {
      filtre.disponible = disponible === 'true';
    }

    // ── 6. Fourchette d'années ───────────────────────────────────────────────
    if (anneeMin || anneeMax) {
      filtre.anneePublication = {};
      if (anneeMin) filtre.anneePublication.$gte = parseInt(anneeMin);
      if (anneeMax) filtre.anneePublication.$lte = parseInt(anneeMax);
    }

    // ── Pagination ───────────────────────────────────────────────────────────
    const skip  = (parseInt(page) - 1) * parseInt(limite);
    const limit = parseInt(limite);

    // ── Tri : par score de pertinence si full-text, sinon par date ───────────
    const projection = useTextSearch ? { score: { $meta: 'textScore' } } : {};
    const tri        = useTextSearch ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

    const [livres, total] = await Promise.all([
      Livre.find(filtre, projection).sort(tri).skip(skip).limit(limit),
      Livre.countDocuments(filtre),
    ]);

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      livres,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── SUGGESTIONS AUTOCOMPLETE ─────────────────────────────────────────────────
// GET /api/livres/suggestions?q=java   → retourne 5 titres/auteurs rapidement

exports.suggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(q, 'i');

    const livres = await Livre.find(
      { $or: [{ titre: regex }, { auteur: regex }] },
      { titre: 1, auteur: 1, genre: 1, disponible: 1 }
    ).limit(5);

    const suggestions = livres.map(l => ({
      id: l._id,
      titre: l.titre,
      auteur: l.auteur,
      genre: l.genre,
      disponible: l.disponible,
    }));

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── LISTER LES GENRES DISPONIBLES ───────────────────────────────────────────
// GET /api/livres/genres → liste des genres distincts dans la BD

exports.getGenres = async (req, res) => {
  try {
    const genres = await Livre.distinct('genre');
    res.json({ genres: genres.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};