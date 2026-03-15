const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Numéro lisible : ARL-2026-00045
  ticket_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  report_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('received', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'received'
  },
  // Historique des changements de statut
  status_history: {
    type: DataTypes.JSONB,
    defaultValue: []
    // ex: [{ status: 'received', date: '...', note: '...' }]
  },
  // Date de résolution
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Priorité : low | medium | high | urgent
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Ticket;
