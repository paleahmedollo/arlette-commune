const { Structure } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const structures = await Structure.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json(structures);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getById = async (req, res) => {
  try {
    const s = await Structure.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Structure introuvable' });
    res.json(s);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.create = async (req, res) => {
  try {
    const structure = await Structure.create(req.body);
    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const s = await Structure.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Structure introuvable' });
    await s.update(req.body);
    res.json(s);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.remove = async (req, res) => {
  try {
    const s = await Structure.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Structure introuvable' });
    await s.update({ is_active: false });
    res.json({ message: 'Structure désactivée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
