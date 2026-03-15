const { Ticket, Report, TicketMessage, User, Notification, Structure, Commune } = require('../models');
const { sendPushNotification } = require('../services/firebase.service');

exports.myTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [{
        model: Report, as: 'report',
        where: { user_id: req.user.id },
        include: [
          { model: Structure, as: 'structure' },
          { model: Commune, as: 'commune' }
        ]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [{
        model: Report, as: 'report',
        include: [
          { model: Structure, as: 'structure' },
          { model: Commune, as: 'commune' },
          { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }
        ]
      }]
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' });

    // Citoyen voit seulement ses tickets
    if (req.user.role === 'citizen' && ticket.report?.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const ticketWhere = {};
    if (status)   ticketWhere.status = status;
    if (priority) ticketWhere.priority = priority;

    const reportWhere = {};
    if (req.user.role === 'agent' && req.user.structure_id) {
      reportWhere.structure_id = req.user.structure_id;
    }

    const tickets = await Ticket.findAll({
      where: ticketWhere,
      include: [{
        model: Report, as: 'report',
        where: reportWhere,
        include: [
          { model: Structure, as: 'structure' },
          { model: Commune, as: 'commune' },
          { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }
        ]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [{ model: Report, as: 'report' }]
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' });

    const sender_type = req.user.role === 'citizen' ? 'citizen' : 'agent';

    const msg = await TicketMessage.create({
      ticket_id: ticket.id,
      sender_type,
      sender_id: req.user.id,
      message
    });

    // Notifier l'autre partie
    let recipientId;
    if (sender_type === 'agent') {
      recipientId = ticket.report?.user_id;
    }
    // (si citoyen envoie, notifier l'agent — à implémenter selon votre flux)

    if (recipientId) {
      const recipient = await User.findByPk(recipientId);
      if (recipient) {
        await Notification.create({
          user_id: recipientId,
          title: '💬 Nouveau message',
          body: `Message sur votre ticket ${ticket.ticket_number}`,
          type: 'new_message',
          data: { ticket_id: ticket.id }
        });
        if (recipient.fcm_token) {
          await sendPushNotification(
            recipient.fcm_token,
            '💬 Nouveau message',
            message.substring(0, 100),
            { ticket_id: ticket.id }
          );
        }
      }
    }

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await TicketMessage.findAll({
      where: { ticket_id: req.params.id },
      include: [{ model: User, as: 'sender', foreignKey: 'sender_id', attributes: ['id', 'first_name', 'last_name', 'role'] }],
      order: [['created_at', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' });

    const history = [...(ticket.status_history || []), {
      status, date: new Date().toISOString(), note: note || ''
    }];

    await ticket.update({
      status, status_history: history,
      resolved_at: status === 'resolved' ? new Date() : ticket.resolved_at
    });

    res.json({ message: 'Statut mis à jour', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' });
    await ticket.update({ priority });
    res.json({ message: 'Priorité mise à jour', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
