const { Report, Ticket, Structure, User, Notification } = require('../models');
const { uploadImage } = require('../services/cloudinary.service');
const { sendPushNotification } = require('../services/firebase.service');
const { v4: uuidv4 } = require('uuid');

// Mapping catégorie → type de structure
const CATEGORY_STRUCTURE_MAP = {
  route:        'mairie',
  lampadaire:   'cie',
  dechets:      'mairie',
  transport:    'mairie',
  eau:          'sodeci',
  electricite:  'cie',
  securite:     'police',
  sante:        'sante',
  autre:        'mairie'
};

// Générer numéro ticket unique : ARL-2026-00045
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Ticket.count();
  const seq = String(count + 1).padStart(5, '0');
  return `ARL-${year}-${seq}`;
};

// POST /api/reports
exports.create = async (req, res) => {
  try {
    const { commune_id, category, quartier, description, latitude, longitude } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Photo obligatoire' });
    if (!commune_id || !category || !quartier) {
      return res.status(400).json({ message: 'Commune, catégorie et quartier sont obligatoires' });
    }

    // Upload photo vers Cloudinary
    const { url: photo_url, public_id: photo_public_id } = await uploadImage(req.file.buffer);

    // Trouver la structure responsable selon catégorie
    const structureType = CATEGORY_STRUCTURE_MAP[category] || 'mairie';
    const structure = await Structure.findOne({
      where: { type: structureType, is_active: true }
    });

    // Créer le signalement
    const report = await Report.create({
      user_id: req.user.id,
      commune_id,
      structure_id: structure?.id || null,
      category,
      quartier,
      description,
      photo_url,
      photo_public_id,
      latitude: latitude || null,
      longitude: longitude || null,
      status: 'received'
    });

    // Créer le ticket automatiquement
    const ticket_number = await generateTicketNumber();
    const ticket = await Ticket.create({
      ticket_number,
      report_id: report.id,
      status: 'received',
      status_history: [{
        status: 'received',
        date: new Date().toISOString(),
        note: 'Signalement reçu et ticket créé automatiquement'
      }]
    });

    // Notification push au citoyen
    if (req.user.fcm_token) {
      await sendPushNotification(
        req.user.fcm_token,
        '✅ Signalement reçu',
        `Votre ticket ${ticket_number} a été créé. Nous traitons votre demande.`,
        { ticket_id: ticket.id, ticket_number }
      );
    }

    // Sauvegarder en base notification
    await Notification.create({
      user_id: req.user.id,
      title: '✅ Signalement reçu',
      body: `Votre ticket ${ticket_number} a été créé avec succès.`,
      type: 'ticket_update',
      data: { ticket_id: ticket.id, ticket_number }
    });

    res.status(201).json({
      message: 'Signalement envoyé avec succès',
      report,
      ticket: { id: ticket.id, ticket_number, status: ticket.status }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET /api/reports/my
exports.myReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: require('../models').Ticket, as: 'ticket' },
        { model: Structure, as: 'structure' },
        { model: require('../models').Commune, as: 'commune' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/reports/:id
exports.getById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        { model: require('../models').Ticket, as: 'ticket', include: [{ model: require('../models').TicketMessage, as: 'messages' }] },
        { model: Structure, as: 'structure' },
        { model: require('../models').Commune, as: 'commune' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ]
    });
    if (!report) return res.status(404).json({ message: 'Signalement introuvable' });

    // Vérifier accès : citoyen voit seulement les siens
    if (req.user.role === 'citizen' && report.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/reports (agents/admin)
exports.getAll = async (req, res) => {
  try {
    const { status, category, commune_id } = req.query;
    const where = {};
    if (status)     where.status = status;
    if (category)   where.category = category;
    if (commune_id) where.commune_id = commune_id;

    // Si agent, filtre par sa structure
    if (req.user.role === 'agent' && req.user.structure_id) {
      where.structure_id = req.user.structure_id;
    }

    const reports = await Report.findAll({
      where,
      include: [
        { model: require('../models').Ticket, as: 'ticket' },
        { model: Structure, as: 'structure' },
        { model: require('../models').Commune, as: 'commune' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/reports/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: Ticket, as: 'ticket' }]
    });
    if (!report) return res.status(404).json({ message: 'Signalement introuvable' });

    await report.update({ status });

    // Mettre à jour le ticket
    if (report.ticket) {
      const history = [...(report.ticket.status_history || []), {
        status,
        date: new Date().toISOString(),
        note: note || ''
      }];

      await report.ticket.update({
        status: status === 'pending' ? 'received' : status,
        status_history: history,
        resolved_at: status === 'resolved' ? new Date() : null
      });

      // Notifier le citoyen
      const citizen = await User.findByPk(report.user_id);
      const statusLabels = {
        received:    '🟡 Signalement reçu',
        in_progress: '🔵 Signalement en cours de traitement',
        resolved:    '🟢 Signalement résolu',
        rejected:    '🔴 Signalement refusé'
      };

      if (citizen) {
        await Notification.create({
          user_id: citizen.id,
          title: statusLabels[status] || 'Mise à jour',
          body: note || `Votre ticket ${report.ticket.ticket_number} a été mis à jour.`,
          type: 'ticket_update',
          data: { ticket_id: report.ticket.id, ticket_number: report.ticket.ticket_number }
        });

        if (citizen.fcm_token) {
          await sendPushNotification(
            citizen.fcm_token,
            statusLabels[status] || 'Mise à jour',
            note || `Votre ticket ${report.ticket.ticket_number} a été mis à jour.`,
            { ticket_id: report.ticket.id }
          );
        }
      }
    }

    res.json({ message: 'Statut mis à jour', status });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
