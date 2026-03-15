const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticket_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  commune_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  structure_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  photo_public_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  quartier: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  address_detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('received', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'received'
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Report;
