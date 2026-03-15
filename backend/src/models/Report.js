const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    allowNull: true  // défini automatiquement selon la catégorie
  },
  // Type de problème
  category: {
    type: DataTypes.ENUM(
      'route',
      'lampadaire',
      'eau',
      'electricite',
      'dechets',
      'securite',
      'sante',
      'transport',
      'autre'
    ),
    allowNull: false
  },
  // Nom du quartier / précision lieu
  quartier: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Photo prise en direct (URL Cloudinary)
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  photo_public_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // GPS
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  // Statut global du signalement
  status: {
    type: DataTypes.ENUM('pending', 'received', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Report;
