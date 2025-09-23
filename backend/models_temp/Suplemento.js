const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Suplemento = sequelize.define('Suplemento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombre_cientifico: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias_suplementos',
      key: 'id'
    }
  },
  descripcion_corta: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  descripcion_detallada: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  para_que_sirve: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  beneficios_principales: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de beneficios principales'
  },
  dosis_recomendada: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  dosis_minima: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dosis_maxima: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  forma_presentacion: {
    type: DataTypes.ENUM('cápsula','tableta','polvo','líquido','goma','inyectable','tópico'),
    defaultValue: 'cápsula'
  },
  frecuencia_recomendada: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '1-2 veces al día'
  },
  mejor_momento_toma: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Con comidas, En ayunas, etc.'
  },
  duracion_tratamiento_tipica: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '3-6 meses, Continuo, etc.'
  },
  popularidad_uso: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Cuántas veces se ha usado/recomendado'
  },
  nivel_evidencia: {
    type: DataTypes.ENUM('alta','media','baja','experimental'),
    defaultValue: 'media'
  },
  precio_referencial: {
    type: DataTypes.DECIMAL(8,2),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Para mostrar en inicio'
  }
}, {
  tableName: 'suplementos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      fields: ['categoria_id']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['destacado']
    },
    {
      fields: ['popularidad_uso']
    },
    {
      fields: ['nombre', 'activo']
    }
  ]
});

module.exports = Suplemento;
