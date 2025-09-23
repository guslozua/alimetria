const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuplementoIndicacion = sequelize.define('SuplementoIndicacion', {
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
  indicacion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hipercolesterolemia, Osteoporosis, etc.'
  },
  perfil_paciente: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Adultos mayores, Deportistas, Embarazadas'
  },
  nivel_recomendacion: {
    type: DataTypes.ENUM('alta','media','baja'),
    defaultValue: 'media'
  },
  notas_adicionales: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'suplemento_indicaciones',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false,
  indexes: [
    {
      fields: ['suplemento_id']
    },
    {
      fields: ['activo']
    }
  ]
});

module.exports = SuplementoIndicacion;
