const sequelize = require('../config/database');
const User = require('./User');
const Commune = require('./Commune');
const Structure = require('./Structure');
const Report = require('./Report');
const Ticket = require('./Ticket');
const TicketMessage = require('./TicketMessage');
const Notification = require('./Notification');

// ── Relations ─────────────────────────────────────────────
// User ↔ Commune
User.belongsTo(Commune, { foreignKey: 'commune_id', as: 'commune' });
Commune.hasMany(User, { foreignKey: 'commune_id' });

// Report ↔ User
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Report, { foreignKey: 'user_id' });

// Report ↔ Commune
Report.belongsTo(Commune, { foreignKey: 'commune_id', as: 'commune' });
Commune.hasMany(Report, { foreignKey: 'commune_id' });

// Report ↔ Structure (structure responsable)
Report.belongsTo(Structure, { foreignKey: 'structure_id', as: 'structure' });
Structure.hasMany(Report, { foreignKey: 'structure_id' });

// Ticket ↔ Report (1-1)
Ticket.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });
Report.hasOne(Ticket, { foreignKey: 'report_id', as: 'ticket' });

// TicketMessage ↔ Ticket
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Ticket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });

// Notification ↔ User
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Commune,
  Structure,
  Report,
  Ticket,
  TicketMessage,
  Notification
};
