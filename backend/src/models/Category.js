const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#FF6600'
  },
  structure_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Type de structure responsable: mairie, police, sodeci, cie, pompiers'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Category;
