const { validationResult } = require('express-validator');
const Paciente = require('../models/Paciente');
const { deleteProfilePhoto } = require('../middleware/photoUpload');

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

  // Subir foto de perfil
  static async uploadProfilePhoto(req, res) {
    try {
      const pacienteId = req.processedFile.pacienteId;
      const filename = req.processedFile.filename;

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Eliminar foto anterior si existe
      if (paciente.foto_perfil) {
        await deleteProfilePhoto(paciente.foto_perfil);
      }

      // Actualizar paciente con nueva foto
      const datosActualizacion = {
        foto_perfil: filename,
        fecha_actualizacion: new Date()
      };

      await paciente.update(datosActualizacion);

      res.json({
        success: true,
        message: 'Foto de perfil actualizada exitosamente',
        data: {
          foto_perfil: filename
        }
      });

    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      
      // Limpiar archivo si hubo error en la base de datos
      if (req.processedFile) {
        await deleteProfilePhoto(req.processedFile.filename);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar foto de perfil
  static async deleteProfilePhoto(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      if (!paciente.foto_perfil) {
        return res.status(400).json({
          success: false,
          message: 'El paciente no tiene foto de perfil'
        });
      }

      // Eliminar archivo físico
      const deleteSuccess = await deleteProfilePhoto(paciente.foto_perfil);
      if (!deleteSuccess) {
        console.warn(`No se pudo eliminar el archivo físico: ${paciente.foto_perfil}`);
      }

      // Actualizar paciente removiendo la foto
      const datosActualizacion = {
        foto_perfil: null,
        fecha_actualizacion: new Date()
      };

      await Paciente.update(id, datosActualizacion);

      res.json({
        success: true,
        message: 'Foto de perfil eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando foto de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Subir foto de perfil
  static async uploadProfilePhoto(req, res) {
    try {
      console.log('🔄 Iniciando uploadProfilePhoto');
      console.log('📁 req.file:', req.file);
      console.log('📋 req.body:', req.body);
      console.log('🔧 req.processedFile:', req.processedFile);
      
      if (!req.processedFile) {
        console.log('❌ No se encontró req.processedFile');
        return res.status(400).json({
          success: false,
          message: 'No se pudo procesar la imagen'
        });
      }

      const { pacienteId, filename } = req.processedFile;

      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Eliminar foto anterior si existe
      if (paciente.foto_perfil) {
        await deleteProfilePhoto(paciente.foto_perfil);
      }

      // Actualizar paciente con nueva foto
      const datosActualizacion = {
        foto_perfil: filename,
        fecha_actualizacion: new Date()
      };

      await paciente.update(datosActualizacion);

      // URL completa para el frontend
      const photoUrl = `/uploads/fotos-perfil/${filename}`;

      res.json({
        success: true,
        message: 'Foto de perfil subida exitosamente',
        data: {
          filename,
          photoUrl,
          paciente_id: pacienteId
        }
      });

    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener citas del paciente
  static async getCitas(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que el paciente existe
      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Importar Cita y TimezoneUtils aquí para evitar dependencia circular
      const Cita = require('../models/Cita');
      const TimezoneUtils = require('../utils/timezoneUtils');
      
      // Obtener todas las citas del paciente
      const citas = await Cita.obtenerTodas({ paciente_id: id });
      
      // Formatear las citas para el frontend con conversión de timezone
      const citasFormateadas = citas.map(cita => ({
        id: cita.id,
        fecha_hora: TimezoneUtils.paraFrontend(cita.fecha_hora),
        duracion_minutos: cita.duracion_minutos,
        tipo_consulta: cita.tipo_consulta,
        estado: cita.estado,
        motivo: cita.motivo,
        notas_previas: cita.notas_previas,
        notas_posteriores: cita.notas_posteriores,
        nutricionista_nombre: cita.nutricionista_nombre,
        consultorio_nombre: cita.consultorio_nombre,
        fecha_creacion: cita.fecha_creacion,
        fecha_actualizacion: cita.fecha_actualizacion,
        // Agregar campos calculados útiles
        es_pasada: TimezoneUtils.esPasado(cita.fecha_hora),
        fecha_formateada: TimezoneUtils.formatearFechaArgentina(cita.fecha_hora)
      }));
      
      res.json({
        success: true,
        data: {
          paciente: {
            id: paciente.id,
            nombre: paciente.nombre,
            apellido: paciente.apellido
          },
          citas: citasFormateadas,
          total: citasFormateadas.length
        }
      });

    } catch (error) {
      console.error('Error obteniendo citas del paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener fotos de evolución del paciente
  static async getFotosEvolucion(req, res) {
    try {
      const { id } = req.params;
      const { tipo_foto, limit } = req.query;
      
      console.log('Obteniendo fotos para paciente ID:', id);
      
      // Verificar que el paciente existe
      const paciente = await Paciente.findById(id);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      console.log('Paciente encontrado:', paciente.nombre);
      
      // Importar FotoPaciente
      const FotoPaciente = require('../models/FotoPaciente');
      
      const opciones = {};
      if (tipo_foto) opciones.tipo_foto = tipo_foto;
      if (limit) opciones.limit = parseInt(limit);
      
      // Obtener fotos del paciente
      const fotos = await FotoPaciente.obtenerPorPaciente(id, opciones);
      
      // Formatear fotos para frontend
      const fotosFormateadas = fotos.map(foto => ({
        id: foto.id,
        ruta_imagen: `/uploads/fotos/${foto.ruta_imagen}`,
        tipo_foto: foto.tipo_foto,
        descripcion: foto.descripcion,
        peso_momento: foto.peso_momento,
        fecha: foto.fecha,
        usuario_nombre: foto.usuario_nombre
      }));
      
      // Obtener estadísticas
      const estadisticas = await FotoPaciente.obtenerEstadisticas(id);
      
      res.json({
        success: true,
        data: {
          paciente: {
            id: paciente.id,
            nombre: paciente.nombre,
            apellido: paciente.apellido
          },
          fotos: fotosFormateadas,
          estadisticas: {
            total: estadisticas.total_fotos || 0,
            frontales: estadisticas.frontales || 0,
            laterales: estadisticas.laterales || 0,
            posteriores: estadisticas.posteriores || 0,
            detalles: estadisticas.detalles || 0,
            primera_foto: estadisticas.primera_foto,
            ultima_foto: estadisticas.ultima_foto
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo fotos de evolución:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Subir foto de evolución
  static async subirFotoEvolucion(req, res) {
    try {
      console.log('Subiendo foto de evolución...');
      console.log('req.body:', req.body);
      
      if (!req.fotoEvolucion) {
        return res.status(400).json({
          success: false,
          message: 'Error procesando la imagen'
        });
      }

      const { pacienteId } = req.body;
      const { tipo_foto, descripcion, peso_momento, medicion_relacionada_id } = req.body;
      
      // Verificar que el paciente existe
      const paciente = await Paciente.findById(pacienteId);
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Importar FotoPaciente
      const FotoPaciente = require('../models/FotoPaciente');
      
      // Crear registro en base de datos
      const fotoData = {
        paciente_id: parseInt(pacienteId),
        ruta_imagen: req.fotoEvolucion.filename,
        tipo_foto: tipo_foto || 'frontal',
        descripcion: descripcion || null,
        peso_momento: peso_momento ? parseFloat(peso_momento) : null,
        medicion_relacionada_id: medicion_relacionada_id ? parseInt(medicion_relacionada_id) : null,
        usuario_id: req.user.id
      };
      
      const nuevaFoto = await FotoPaciente.crear(fotoData);
      
      res.json({
        success: true,
        message: 'Foto de evolución subida y optimizada exitosamente',
        data: {
          id: nuevaFoto.id,
          ruta_imagen: `/uploads/fotos/${nuevaFoto.ruta_imagen}`,
          tipo_foto: nuevaFoto.tipo_foto,
          descripcion: nuevaFoto.descripcion,
          peso_momento: nuevaFoto.peso_momento,
          fecha: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error subiendo foto de evolución:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar foto de evolución
  static async eliminarFotoEvolucion(req, res) {
    try {
      const { fotoId } = req.params;
      
      console.log('Eliminando foto ID:', fotoId);
      
      // Importar FotoPaciente
      const FotoPaciente = require('../models/FotoPaciente');
      
      // Verificar que la foto existe
      const foto = await FotoPaciente.obtenerPorId(fotoId);
      if (!foto) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }
      
      // Eliminar registro de la base de datos
      await FotoPaciente.eliminar(fotoId);
      
      // Intentar eliminar archivo físico
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const filepath = path.join(__dirname, '../uploads/fotos', foto.ruta_imagen);
        await fs.unlink(filepath);
        console.log('Archivo físico eliminado:', foto.ruta_imagen);
      } catch (error) {
        console.warn('No se pudo eliminar el archivo físico:', error.message);
      }
      
      res.json({
        success: true,
        message: 'Foto eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando foto de evolución:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = PacienteController;
