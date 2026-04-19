const mongoose = require('mongoose');

const empruntSchema = new mongoose.Schema({
  livre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livre',
    required: true,
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateEmprunt: {
    type: Date,
    default: Date.now,
  },
  dateRetourPrevue: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    },
  },
  dateRetourReelle: {
    type: Date,
    default: null,
  },
  statut: {
    type: String,
    enum: ['en_cours', 'rendu', 'en_retard'],
    default: 'en_cours',
  },
  penalite: {
    joursRetard: { type: Number, default: 0 },
    montant:     { type: Number, default: 0 },
    payee:       { type: Boolean, default: false },
  },
}, { timestamps: true });

const TARIF_PAR_JOUR = 2;

empruntSchema.methods.calculerPenalite = function() {
  const dateRef = this.dateRetourReelle || new Date();
  if (dateRef <= this.dateRetourPrevue) {
    this.penalite.joursRetard = 0;
    this.penalite.montant = 0;
    return this.penalite;
  }
  const diff  = dateRef - this.dateRetourPrevue;
  const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
  this.penalite.joursRetard = jours;
  this.penalite.montant     = jours * TARIF_PAR_JOUR;
  return this.penalite;
};

// ← Version corrigée sans try/catch qui interfère avec Mongoose
empruntSchema.pre('save', async function() {
  if (this.dateRetourReelle) {
    this.statut = 'rendu';
  } else if (this.dateRetourPrevue && new Date() > this.dateRetourPrevue) {
    this.statut = 'en_retard';
  } else {
    this.statut = 'en_cours';
  }
});

module.exports = mongoose.model('Emprunt', empruntSchema);