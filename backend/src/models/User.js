const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commune_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // Rôle : citizen | agent | admin | super_admin
  role: {
    type: DataTypes.ENUM('citizen', 'agent', 'admin', 'super_admin'),
    defaultValue: 'citizen'
  },
  // Structure associée (pour les agents)
  structure_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // Vérification OTP SMS
  is_phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Token FCM pour notifications push
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
