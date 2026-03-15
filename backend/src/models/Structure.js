const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Structures responsables : Mairie, Police, SODECI, CIE, Pompiers, etc.
const Structure = sequelize.define('Structure', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'mairie',
      'police',
      'sodeci',
      'cie',
      'pompiers',
      'sante',
      'transport',
      'environnement',
      'autre'
    ),
    allowNull: false
  },
  // Catégories de problèmes gérées par cette structure
  // ex: ["route","lampadaire","dechets"]
  categories: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  commune_id: {
    type: DataTypes.UUID,
    allowNull: true  // null = structure nationale
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'structures',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Structure;
