const User      = require('../models/User');
const jwt       = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// ─── Générer un token JWT ─────────────────────────────────────────────────────
const genererToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Inscription ──────────────────────────────────────────────────────────────
exports.inscrire = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const user = new User({ nom, email, motDePasse, role });
    await user.save();

    const token = genererToken(user);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Connexion ────────────────────────────────────────────────────────────────
exports.connecter = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const valide = await user.comparerMotDePasse(motDePasse);
    if (!valide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = genererToken(user);

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Profil utilisateur connecté ─────────────────────────────────────────────
exports.getProfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Lister tous les utilisateurs (admin) ────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse');
    res.json({ total: users.length, users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};