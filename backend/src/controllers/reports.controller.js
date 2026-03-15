const { Report, User, Commune, Structure, Category, Message, Notification } = require('../models');
const { uploadImage } = require('../services/upload.service');
const { Op } = require('sequelize');

// Générer numéro de ticket unique
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Report.count();
  const num = String(count + 1).padStart(5, '0');
  return `ARL-${year}-${num}`;
};

// POST /reports — Créer un signalement
const createReport = async (req, res) => {
  try {
    const { commune_id, category_id, description, latitude, longitude, quartier, address_detail } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: 'Photo obligatoire' });
    if (!commune_id || !category_id || !quartier) {
      return res.status(400).json({ success: false, message: 'Commune, catégorie et quartier sont obligatoires' });
    }

    // Upload photo vers Cloudinary
    const uploadResult = await uploadImage(req.file.buffer, 'arlette-commune/signalements');

    // Trouver la structure responsable selon la catégorie
    const category = await Category.findByPk(category_id);
    if (!category) return res.status(404).json({ success: false, message: 'Catégorie introuvable' });

    const structure = await Structure.findOne({
      where: { type: category.structure_type, commune_id, is_active: true }
    });

    const ticket_number = await generateTicketNumber();

    const report = await Report.create({
      ticket_number,
      user_id: req.user.id,
      commune_id,
      category_id,
      structure_id: structure ? structure.id : null,
      description: description || null,
      photo_url: uploadResult.secure_url,
      photo_public_id: uploadResult.public_id,
      latitude: latitude || null,
      longitude: longitude || null,
      quartier,
      address_detail: address_detail || null,
      status: 'received'
    });

    // Créer notification pour le citoyen
    await Notification.create({
      user_id: req.user.id,
      report_id: report.id,
      title: 'Signalement reçu ✅',
      body: `Votre signalement ${ticket_number} a bien été reçu et transmis.`,
      type: 'ticket_created'
    });

    const fullReport = await Report.findByPk(report.id, {
      include: [
        { association: 'category' },
        { association: 'commune' },
        { association: 'structure' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Signalement créé avec succès',
      data: fullReport
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// GET /reports — Mes signalements (citoyen)
const getMyReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const reports = await Report.findAndCountAll({
      where,
      include: [
        { association: 'category' },
        { association: 'commune' },
        { association: 'structure' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: reports.rows,
      total: reports.count,
      page: parseInt(page),
      pages: Math.ceil(reports.count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// GET /reports/:id — Détail d'un signalement
const getReportById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        { association: 'category' },
        { association: 'commune' },
        { association: 'structure' },
        { association: 'citizen', attributes: ['id', 'first_name', 'last_name', 'phone'] },
        { association: 'messages', include: [{ association: 'sender', attributes: ['id', 'first_name', 'last_name', 'role'] }] }
      ]
    });
    if (!report) return res.status(404).json({ success: false, message: 'Signalement introuvable' });

    // Vérifier accès
    const isCitizen = req.user.role === 'citizen' && report.user_id !== req.user.id;
    if (isCitizen) return res.status(403).json({ success: false, message: 'Accès refusé' });

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// PUT /reports/:id/status — Changer le statut (agent/admin)
const updateStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const validStatuses = ['received', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Signalement introuvable' });

    const updateData = { status };
    if (status === 'resolved') updateData.resolved_at = new Date();
    if (status === 'rejected' && rejection_reason) updateData.rejection_reason = rejection_reason;

    await report.update(updateData);

    // Notifier le citoyen
    const statusLabels = {
      in_progress: '🔵 En cours de traitement',
      resolved: '🟢 Résolu',
      rejected: '🔴 Refusé'
    };

    if (statusLabels[status]) {
      await Notification.create({
        user_id: report.user_id,
        report_id: report.id,
        title: `Ticket ${report.ticket_number} mis à jour`,
        body: `Votre signalement est maintenant : ${statusLabels[status]}`,
        type: 'status_update'
      });
    }

    res.json({ success: true, message: 'Statut mis à jour', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// GET /reports — Tous les signalements (agent/admin)
const getAllReports = async (req, res) => {
  try {
    const { status, commune_id, category_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (commune_id) where.commune_id = commune_id;
    if (category_id) where.category_id = category_id;

    // Si agent, filtrer par sa structure
    if (req.user.role === 'agent' && req.user.structure_id) {
      where.structure_id = req.user.structure_id;
    }

    const reports = await Report.findAndCountAll({
      where,
      include: [
        { association: 'category' },
        { association: 'commune' },
        { association: 'structure' },
        { association: 'citizen', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: reports.rows,
      total: reports.count,
      page: parseInt(page),
      pages: Math.ceil(reports.count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { createReport, getMyReports, getReportById, updateStatus, getAllReports };
