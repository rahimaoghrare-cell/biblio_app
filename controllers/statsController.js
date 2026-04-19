const Emprunt = require('../models/Emprunt');
const Livre   = require('../models/Livre');
const User    = require('../models/User');

// ─── Tableau de bord général ──────────────────────────────────────────────────
// GET /api/stats/dashboard
exports.dashboard = async (req, res) => {
  try {
    const [
      totalLivres,
      livresDisponibles,
      totalUsers,
      totalEmprunts,
      empruntsEnCours,
      empruntsEnRetard,
      penalitesNonPayees,
    ] = await Promise.all([
      Livre.countDocuments(),
      Livre.countDocuments({ disponible: true }),
      User.countDocuments(),
      Emprunt.countDocuments(),
      Emprunt.countDocuments({ statut: 'en_cours' }),
      Emprunt.countDocuments({ statut: 'en_retard' }),
      Emprunt.aggregate([
        { $match: { 'penalite.payee': false, 'penalite.montant': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$penalite.montant' } } },
      ]),
    ]);

    res.json({
      livres: {
        total: totalLivres,
        disponibles: livresDisponibles,
        empruntes: totalLivres - livresDisponibles,
      },
      utilisateurs: { total: totalUsers },
      emprunts: {
        total: totalEmprunts,
        enCours: empruntsEnCours,
        enRetard: empruntsEnRetard,
        rendus: totalEmprunts - empruntsEnCours - empruntsEnRetard,
      },
      penalites: {
        montantNonPaye: penalitesNonPayees[0]?.total || 0,
        unite: 'DH',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Top 5 livres les plus empruntés ─────────────────────────────────────────
// GET /api/stats/top-livres
exports.topLivres = async (req, res) => {
  try {
    const top = await Emprunt.aggregate([
      { $group: { _id: '$livre', nombreEmprunts: { $sum: 1 } } },
      { $sort: { nombreEmprunts: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'livres',
          localField: '_id',
          foreignField: '_id',
          as: 'livre',
        },
      },
      { $unwind: '$livre' },
      {
        $project: {
          _id: 0,
          titre: '$livre.titre',
          auteur: '$livre.auteur',
          genre: '$livre.genre',
          nombreEmprunts: 1,
        },
      },
    ]);

    res.json({ top });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Top 5 utilisateurs les plus actifs ──────────────────────────────────────
// GET /api/stats/top-users
exports.topUsers = async (req, res) => {
  try {
    const top = await Emprunt.aggregate([
      { $group: { _id: '$utilisateur', nombreEmprunts: { $sum: 1 } } },
      { $sort: { nombreEmprunts: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          nom: '$user.nom',
          email: '$user.email',
          nombreEmprunts: 1,
        },
      },
    ]);

    res.json({ top });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Emprunts par mois (12 derniers mois) ────────────────────────────────────
// GET /api/stats/emprunts-par-mois
exports.empruntParMois = async (req, res) => {
  try {
    const douzesMoisAvant = new Date();
    douzesMoisAvant.setMonth(douzesMoisAvant.getMonth() - 11);

    const stats = await Emprunt.aggregate([
      { $match: { dateEmprunt: { $gte: douzesMoisAvant } } },
      {
        $group: {
          _id: {
            annee: { $year: '$dateEmprunt' },
            mois:  { $month: '$dateEmprunt' },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.annee': 1, '_id.mois': 1 } },
      {
        $project: {
          _id: 0,
          periode: {
            $concat: [
              { $toString: '$_id.annee' }, '-',
              { $cond: [{ $lt: ['$_id.mois', 10] }, { $concat: ['0', { $toString: '$_id.mois' }] }, { $toString: '$_id.mois' }] },
            ],
          },
          total: 1,
        },
      },
    ]);

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ─── Statistiques par genre ───────────────────────────────────────────────────
// GET /api/stats/par-genre
exports.parGenre = async (req, res) => {
  try {
    const stats = await Emprunt.aggregate([
      {
        $lookup: {
          from: 'livres',
          localField: 'livre',
          foreignField: '_id',
          as: 'livre',
        },
      },
      { $unwind: '$livre' },
      {
        $group: {
          _id: '$livre.genre',
          nombreEmprunts: { $sum: 1 },
        },
      },
      { $sort: { nombreEmprunts: -1 } },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          nombreEmprunts: 1,
        },
      },
    ]);

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};