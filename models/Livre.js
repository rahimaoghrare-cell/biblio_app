const mongoose = require('mongoose');

const livreSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  auteur: {
    type: String,
    required: true,
    trim: true,
  },
  ISBN: {
    type: String,
    unique: true,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
    lowercase: true,
    // ex: 'informatique', 'roman', 'science', 'histoire', 'droit'
  },
  anneePublication: {
    type: Number,
  },
  editeur: {
    type: String,
    trim: true,
  },
  nombreExemplaires: {
    type: Number,
    default: 1,
    min: 0,
  },
  disponible: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// ─── Index full-text sur titre, auteur et description ────────────────────────
// Permet d'utiliser $text dans les requêtes MongoDB
livreSchema.index(
  { titre: 'text', auteur: 'text', description: 'text' },
  { weights: { titre: 10, auteur: 5, description: 1 }, name: 'recherche_fulltext' }
);

// ─── Index simple pour les filtres fréquents ─────────────────────────────────
livreSchema.index({ genre: 1 });
livreSchema.index({ disponible: 1 });
livreSchema.index({ anneePublication: 1 });

module.exports = mongoose.model('Livre', livreSchema);