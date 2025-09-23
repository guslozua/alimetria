const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuplementoInteraccion = sequelize.define('SuplementoInteraccion', {
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
  tipo_interaccion: {
    type: DataTypes.ENUM('medicamento','suplemento','alimento'),
    allowNull: false
  },
  nombre_interaccion: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Warfarina, Vitamina E, Lácteos'
  },
  descripcion_interaccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  severidad: {
    type: DataTypes.ENUM('grave','moderada','leve'),
    defaultValue: 'moderada'
  },
  recomendacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Evitar, Separar 2 horas, etc.'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'suplemento_interacciones',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false,
  indexes: [
    {
      fields: ['suplemento_id']
    },
    {
      fields: ['severidad']
    },
    {
      fields: ['activo']
    }
  ]
});

module.exports = SuplementoInteraccion;
