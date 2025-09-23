const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaSuplemento = sequelize.define('CategoriaSuplemento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#667eea'
  },
  icono: {
    type: DataTypes.STRING(50),
    defaultValue: 'supplement'
  },
  orden_visualizacion: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias_suplementos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      fields: ['activo', 'orden_visualizacion']
    },
    {
      fields: ['nombre']
    }
  ]
});

module.exports = CategoriaSuplemento;
