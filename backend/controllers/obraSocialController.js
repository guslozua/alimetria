const { validationResult } = require('express-validator');
const ObraSocial = require('../models/ObraSocial');

class ObraSocialController {
  // Obtener todas las obras sociales
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        orderBy = 'nombre',
        orderDirection = 'ASC'
      } = req.query;

      // Para listado simple sin paginación (usado en selects)
      if (req.query.simple === 'true') {
        const obrasSociales = await ObraSocial.findAll({
          orderBy: 'nombre',
          orderDirection: 'ASC'
        });

        return res.json({
          success: true,
          data: {
            obrasSociales: obrasSociales.map(os => os.toListSummary())
          }
        });
      }

      // Calcular offset para paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const filters = {
        limit: parseInt(limit),
        offset,
        search,
        orderBy,
        orderDirection: orderDirection.toUpperCase()
      };

      const obrasSociales = await ObraSocial.findAll(filters);

      // Obtener total para paginación (sin límite)
      const totalFilters = { ...filters };
      delete totalFilters.limit;
      delete totalFilters.offset;
      const totalObrasSociales = await ObraSocial.findAll(totalFilters);
      const total = totalObrasSociales.length;

      const response = {
        success: true,
        data: {
          obrasSociales: obrasSociales.map(os => os.toListSummary()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Error obteniendo obras sociales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener obra social por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const obraSocial = await ObraSocial.findById(id);

      if (!obraSocial) {
        return res.status(404).json({
          success: false,
          message: 'Obra social no encontrada'
        });
      }

      res.json({
        success: true,
        data: { obraSocial }
      });

    } catch (error) {
      console.error('Error obteniendo obra social:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear nueva obra social
  static async create(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const obraSocialData = req.body;
      const nuevaObraSocial = await ObraSocial.create(obraSocialData);

      res.status(201).json({
        success: true,
        message: 'Obra social creada exitosamente',
        data: { obraSocial: nuevaObraSocial }
      });

    } catch (error) {
      console.error('Error creando obra social:', error);
      
      // Manejar errores específicos
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar obra social
  static async update(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const obraSocial = await ObraSocial.findById(id);
      if (!obraSocial) {
        return res.status(404).json({
          success: false,
          message: 'Obra social no encontrada'
        });
      }

      const obraSocialActualizada = await obraSocial.update(updateData);

      res.json({
        success: true,
        message: 'Obra social actualizada exitosamente',
        data: { obraSocial: obraSocialActualizada }
      });

    } catch (error) {
      console.error('Error actualizando obra social:', error);
      
      // Manejar errores específicos
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar obra social (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const obraSocial = await ObraSocial.findById(id);
      if (!obraSocial) {
        return res.status(404).json({
          success: false,
          message: 'Obra social no encontrada'
        });
      }

      // Verificar si tiene pacientes asociados
      const pacientes = await obraSocial.getPacientes();
      if (pacientes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar la obra social porque tiene ${pacientes.length} paciente(s) asociado(s)`
        });
      }

      await obraSocial.deactivate();

      res.json({
        success: true,
        message: 'Obra social eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando obra social:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener pacientes de una obra social
  static async getPacientes(req, res) {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const obraSocial = await ObraSocial.findById(id);
      if (!obraSocial) {
        return res.status(404).json({
          success: false,
          message: 'Obra social no encontrada'
        });
      }

      const pacientes = await obraSocial.getPacientes(limit ? parseInt(limit) : null);

      res.json({
        success: true,
        data: { pacientes }
      });

    } catch (error) {
      console.error('Error obteniendo pacientes de la obra social:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener estadísticas de una obra social
  static async getEstadisticas(req, res) {
    try {
      const { id } = req.params;

      const obraSocial = await ObraSocial.findById(id);
      if (!obraSocial) {
        return res.status(404).json({
          success: false,
          message: 'Obra social no encontrada'
        });
      }

      const estadisticas = await obraSocial.getEstadisticas();

      res.json({
        success: true,
        data: { estadisticas }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de la obra social:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Búsqueda rápida de obras sociales
  static async search(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: { obrasSociales: [] }
        });
      }

      const filters = {
        search: q,
        limit: 10
      };

      const obrasSociales = await ObraSocial.findAll(filters);

      res.json({
        success: true,
        data: { 
          obrasSociales: obrasSociales.map(os => ({
            id: os.id,
            nombre: os.nombre,
            codigo: os.codigo
          }))
        }
      });

    } catch (error) {
      console.error('Error en búsqueda de obras sociales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = ObraSocialController;
