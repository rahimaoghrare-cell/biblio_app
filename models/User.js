const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nom:   { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  motDePasse: { type: String, required: true },
  role:  { type: String, enum: ['etudiant', 'admin'], default: 'etudiant' },
  penalite: { type: Number, default: 0 },
  date_inscription: { type: Date, default: Date.now },
}, { timestamps: true });

// ─── Hasher le mot de passe avant save ───────────────────────────────────────
UserSchema.pre('save', async function() {
  if (!this.isModified('motDePasse')) return;
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
});

// ─── Comparer le mot de passe ─────────────────────────────────────────────────
UserSchema.methods.comparerMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = mongoose.model('User', UserSchema);