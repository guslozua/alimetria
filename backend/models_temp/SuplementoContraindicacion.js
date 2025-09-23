const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuplementoContraindicacion = sequelize.define('SuplementoContraindicacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  suplemento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'suplementos',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('contraindicacion','precaucion','advertencia'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  poblacion_afectada: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Embarazadas, Personas con diabetes'
  },
  severidad: {
    type: DataTypes.ENUM('alta','media','baja'),
    defaultValue: 'media'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'suplemento_contraindicaciones',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false,
  indexes: [
    {
      fields: ['suplemento_id']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['activo']
    }
  ]
});

module.exports = SuplementoContraindicacion;
