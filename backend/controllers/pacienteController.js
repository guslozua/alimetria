const { validationResult } = require('express-validator');
const Paciente = require('../models/Paciente');

class PacienteController {
  // Obtener todos los pacientes
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sexo,
        edad_min,
        edad_max,
        orderBy = 'nombre',
        orderDirection = 'ASC'
      } = req.query;

      // Calcular offset para paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Filtros basados en rol del usuario
      const filters = {
        limit: parseInt(limit),
        offset,
        search,
        sexo,
        edad_min: edad_min ? parseInt(edad_min) : null,
        edad_max: edad_max ? parseInt(edad_max) : null,
        orderBy,
        orderDirection: orderDirection.toUpperCase()
      };

      // Si no es administrador, filtrar por consultorio
      if (req.user.rol !== 'administrador' && req.user.consultoirioId) {
        filters.consultorio_id = req.user.consultoirioId;
      }

      const pacientes = await Paciente.findAll(filters);

      // Obtener total para paginación (sin límite)
      const totalFilters = { ...filters };
      delete totalFilters.limit;
      delete totalFilters.offset;
      const totalPacientes = await Paciente.findAll(totalFilters);
      const total = totalPacientes.length;

      const response = {
        success: true,
        data: {
          pacientes: pacientes.map(p => p.toListSummary()),
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
      console.error('Error obteniendo pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener paciente por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const paciente = await Paciente.findById(id);

      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar permisos de consultorio si no es admin
      if (req.user.rol !== 'administrador' && 
          paciente.consultorio_id !== req.user.consultoirioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este paciente'
        });
      }

      console.log('Paciente encontrado en BD para edición:', paciente);
      console.log('Campos específicos:', {
        fecha_nacimiento: paciente.fecha_nacimiento,
        altura_inicial: paciente.altura_inicial,
        peso_inicial: paciente.peso_inicial,
        direccion: paciente.direccion,
        ocupacion: paciente.ocupacion,
        objetivo: paciente.objetivo,
        observaciones_generales: paciente.observaciones_generales
      });

      res.json({
        success: true,
        data: { paciente }
      });

    } catch (error) {
      console.error('Error obteniendo paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear nuevo paciente
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

      const pacienteData = req.body;

      // Verificar si el email ya existe
      if (pacienteData.email) {
        const emailExists = await Paciente.emailExists(pacienteData.email);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Este email ya está registrado'
          });
        }
      }

      // Asignar usuario creador y consultorio
      pacienteData.usuario_creador_id = req.user.userId;
      
      // Si no es admin y no especifica consultorio, usar el del usuario
      if (req.user.rol !== 'administrador' && !pacienteData.consultorio_id) {
        pacienteData.consultorio_id = req.user.consultoirioId;
      }

      const nuevoPaciente = await Paciente.create(pacienteData);

      res.status(201).json({
        success: true,
        message: 'Paciente creado exitosamente',
        data: { paciente: nuevoPaciente }
      });

    } catch (error) {
      console.error('Error creando paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar paciente
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

      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar permisos de consultorio si no es admin
      if (req.user.rol !== 'administrador' && 
          paciente.consultorio_id !== req.user.consultoirioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este paciente'
        });
      }

      // Verificar email si se está cambiando
      if (updateData.email && updateData.email !== paciente.email) {
        const emailExists = await Paciente.emailExists(updateData.email, paciente.id);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Este email ya está registrado'
          });
        }
      }

      const pacienteActualizado = await paciente.update(updateData);

      res.json({
        success: true,
        message: 'Paciente actualizado exitosamente',
        data: { paciente: pacienteActualizado }
      });

    } catch (error) {
      console.error('Error actualizando paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar paciente (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar permisos de consultorio si no es admin
      if (req.user.rol !== 'administrador' && 
          paciente.consultorio_id !== req.user.consultoirioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este paciente'
        });
      }

      await paciente.deactivate();

      res.json({
        success: true,
        message: 'Paciente eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener mediciones del paciente
  static async getMediciones(req, res) {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar permisos de consultorio si no es admin
      if (req.user.rol !== 'administrador' && 
          paciente.consultorio_id !== req.user.consultoirioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las mediciones de este paciente'
        });
      }

      const mediciones = await paciente.getMediciones(limit ? parseInt(limit) : null);

      res.json({
        success: true,
        data: { mediciones }
      });

    } catch (error) {
      console.error('Error obteniendo mediciones del paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener estadísticas del paciente
  static async getEstadisticas(req, res) {
    try {
      const { id } = req.params;

      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar permisos de consultorio si no es admin
      if (req.user.rol !== 'administrador' && 
          paciente.consultorio_id !== req.user.consultoirioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las estadísticas de este paciente'
        });
      }

      const estadisticas = await paciente.getEstadisticas();

      res.json({
        success: true,
        data: { estadisticas }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener fotos del paciente
  static async getFotos(req, res) {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar permisos de consultorio si no es admin
      if (req.user.rol !== 'administrador' && 
          paciente.consultorio_id !== req.user.consultoirioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las fotos de este paciente'
        });
      }

      const fotos = await paciente.getFotos(limit ? parseInt(limit) : null);

      res.json({
        success: true,
        data: { fotos }
      });

    } catch (error) {
      console.error('Error obteniendo fotos del paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Búsqueda rápida de pacientes
  static async search(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: { pacientes: [] }
        });
      }

      const filters = {
        search: q,
        limit: 10
      };

      // Si no es administrador, filtrar por consultorio
      if (req.user.rol !== 'administrador' && req.user.consultoirioId) {
        filters.consultorio_id = req.user.consultoirioId;
      }

      const pacientes = await Paciente.findAll(filters);

      res.json({
        success: true,
        data: { 
          pacientes: pacientes.map(p => ({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            email: p.email,
            edad: p.edad
          }))
        }
      });

    } catch (error) {
      console.error('Error en búsqueda de pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = PacienteController;
