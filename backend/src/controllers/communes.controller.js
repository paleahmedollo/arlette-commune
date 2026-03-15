const { Commune } = require('../models');
const { Op } = require('sequelize');

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const communes = await Commune.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { city: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 10,
      order: [['name', 'ASC']]
    });

    res.json(communes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const communes = await Commune.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json(communes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getById = async (req, res) => {
  try {
    const commune = await Commune.findByPk(req.params.id);
    if (!commune) return res.status(404).json({ message: 'Commune introuvable' });
    res.json(commune);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
