const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuplementoReferencia = sequelize.define('SuplementoReferencia', {
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
  titulo_estudio: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  autores: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  revista_publicacion: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  año_publicacion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo_estudio: {
    type: DataTypes.ENUM('ensayo_clinico','revision_sistematica','meta_analisis','observacional','caso_control'),
    defaultValue: 'observacional'
  },
  url_referencia: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  resumen_hallazgos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calidad_evidencia: {
    type: DataTypes.ENUM('alta','moderada','baja','muy_baja'),
    defaultValue: 'moderada'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'suplemento_referencias',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false,
  indexes: [
    {
      fields: ['suplemento_id']
    },
    {
      fields: ['año_publicacion']
    },
    {
      fields: ['activo']
    }
  ]
});

module.exports = SuplementoReferencia;
