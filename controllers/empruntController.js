const Emprunt = require('../models/Emprunt');
const Livre   = require('../models/Livre');
const User    = require('../models/User');

exports.creerEmprunt = async (req, res) => {
  try {
    const { livreId, utilisateurId, dateRetourPrevue } = req.body;

    console.log('Body reçu:', req.body); // ← on voit ce qui arrive

    const livre = await Livre.findById(livreId);
    console.log('Livre trouvé:', livre);

    if (!livre) return res.status(404).json({ message: 'Livre introuvable' });
    if (livre.disponible === false) return res.status(400).json({ message: 'Livre déjà emprunté' });

    const emprunt = new Emprunt({
      livre:            livreId,
      utilisateur:      utilisateurId,
      dateRetourPrevue: dateRetourPrevue ? new Date(dateRetourPrevue) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    console.log('Emprunt avant save:', emprunt);

    await emprunt.save();

    livre.disponible = false;
    await livre.save();

    res.status(201).json({ message: 'Emprunt créé', emprunt });
  } catch (err) {
    console.error('ERREUR COMPLETE:', err); // ← erreur complète dans le terminal
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.retournerLivre    = async (req, res) => res.json({ message: 'ok' });
exports.payerPenalite     = async (req, res) => res.json({ message: 'ok' });
exports.getEmpruntsEnRetard = async (req, res) => res.json({ message: 'ok' });
exports.getAllEmprunts     = async (req, res) => res.json({ total: 0, emprunts: [] });