const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'biblio_secret_key_2024';

// ─── Vérifier le token JWT ────────────────────────────────────────────────────
const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé — token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

// ─── Vérifier le rôle admin ───────────────────────────────────────────────────
const verifierAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
};

module.exports = { verifierToken, verifierAdmin, JWT_SECRET };