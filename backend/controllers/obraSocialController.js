const { validationResult } = require('express-validator');
const ObraSocial = require('../models/ObraSocial');
const { executeQuery } = require('../config/database');

class ObraSocialController {
  // Obtener todas las obras sociales
  static async getAll(req, res) {
    try {
      console.log('🏥 Controller getAll - Query params:', req.query);
      
      const {
        page = 1,
        limit = 50,
        search,
        orderBy = 'nombre',
        orderDirection = 'ASC'
      } = req.query;

      // Para listado simple sin paginación (usado en selects)
      if (req.query.simple === 'true') {
        console.log('📋 Modo simple solicitado');
        const obrasSociales = await ObraSocial.findAll({
          orderBy: 'nombre',
          orderDirection: 'ASC'
        });
        
        console.log('🏥 Obras sociales encontradas (simple):', obrasSociales.length);

        return res.json({
          success: true,
          data: {
            obrasSociales: obrasSociales.map(os => os.toListSummary())
          }
        });
      }

      console.log('📋 Modo paginado solicitado - page:', page, 'limit:', limit);
      
      // Calcular offset para paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const filters = {
        limit: parseInt(limit),
        offset,
        search,
        orderBy,
        orderDirection: orderDirection.toUpperCase()
      };
      
      console.log('🔍 Filtros aplicados:', filters);

      const obrasSociales = await ObraSocial.findAll(filters);
      console.log('🏥 Obras sociales encontradas:', obrasSociales.length);

      // Obtener total para paginación (sin límite)
      const totalFilters = { ...filters };
      delete totalFilters.limit;
      delete totalFilters.offset;
      const totalObrasSociales = await ObraSocial.findAll(totalFilters);
      const total = totalObrasSociales.length;
      
      console.log('📊 Total de obras sociales:', total);

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
      
      console.log('📎 Response final:', {
        success: response.success,
        obrasSocialesCount: response.data.obrasSociales.length,
        pagination: response.data.pagination
      });

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
      
      if (!q || q.trim().length < 1) {
        return res.json({
          success: true,
          data: { obrasSociales: [] }
        });
      }
      
      const filters = {
        search: q.trim(),
        limit: 20 // Limitar resultados de búsqueda
      };
      
      const obrasSociales = await ObraSocial.findAll(filters);
      
      res.json({
        success: true,
        data: {
          obrasSociales: obrasSociales.map(os => os.toListSummary())
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

  // Obtener estadísticas globales de obras sociales
  static async getEstadisticasGlobales(req, res) {
    try {
      console.log('📊 Obteniendo estadísticas globales de obras sociales...');
      
      // Estadísticas de obras sociales
      const statsQuery = `
        SELECT 
          COUNT(*) as total_obras_sociales,
          COUNT(CASE WHEN (SELECT COUNT(*) FROM pacientes p WHERE p.obra_social_id = os.id AND p.activo = TRUE) > 0 THEN 1 END) as obras_con_pacientes,
          COUNT(CASE WHEN (SELECT COUNT(*) FROM pacientes p WHERE p.obra_social_id = os.id AND p.activo = TRUE) = 0 THEN 1 END) as obras_sin_pacientes
        FROM obras_sociales os
        WHERE os.activo = TRUE
      `;
      
      // Estadísticas de pacientes
      const pacientesQuery = `
        SELECT 
          COUNT(*) as total_pacientes,
          COUNT(CASE WHEN os.codigo = 'PARTICULAR' OR os.codigo = 'PART' THEN 1 END) as pacientes_particulares,
          COUNT(CASE WHEN os.codigo != 'PARTICULAR' AND os.codigo != 'PART' THEN 1 END) as pacientes_con_obra_social
        FROM pacientes p
        LEFT JOIN obras_sociales os ON p.obra_social_id = os.id
        WHERE p.activo = TRUE
      `;
      
      const statsResult = await executeQuery(statsQuery);
      const pacientesResult = await executeQuery(pacientesQuery);
      
      console.log('📈 Estadísticas de obras sociales:', statsResult[0]);
      console.log('🏥 Estadísticas de pacientes:', pacientesResult[0]);
      
      const estadisticas = {
        obras_sociales: {
          total: statsResult[0].total_obras_sociales,
          con_pacientes: statsResult[0].obras_con_pacientes,
          sin_pacientes: statsResult[0].obras_sin_pacientes
        },
        pacientes: {
          total: pacientesResult[0].total_pacientes,
          particulares: pacientesResult[0].pacientes_particulares,
          con_obra_social: pacientesResult[0].pacientes_con_obra_social,
          porcentaje_particulares: pacientesResult[0].total_pacientes > 0 
            ? Math.round((pacientesResult[0].pacientes_particulares / pacientesResult[0].total_pacientes) * 100)
            : 0
        }
      };
      
      console.log('✅ Estadísticas finales:', estadisticas);
      
      res.json({
        success: true,
        data: estadisticas
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas globales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = ObraSocialController;
