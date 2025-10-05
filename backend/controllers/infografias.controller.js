const Infografia = require('../models/Infografia');
const CategoriaInfografia = require('../models/CategoriaInfografia');
const path = require('path');
const fs = require('fs').promises;

// Listar todas las infografías con filtros
exports.listarInfografias = async (req, res) => {
  try {
    const { categoria_id, busqueda, limite, offset, incluir_inactivas } = req.query;
    
    const filtros = {
      categoria_id: categoria_id ? parseInt(categoria_id) : null,
      busqueda: busqueda || null,
      limite: limite ? parseInt(limite) : 50,
      offset: offset ? parseInt(offset) : 0
    };
    
    // Solo incluir inactivas si se solicita explícitamente (panel admin)
    if (incluir_inactivas !== 'true') {
      filtros.activo = 1;
    }
    
    const infografias = await Infografia.getAll(filtros);
    
    res.json({
      success: true,
      data: infografias,
      count: infografias.length
    });
  } catch (error) {
    console.error('Error al listar infografías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener infografías',
      error: error.message
    });
  }
};

// Obtener una infografía por ID
exports.obtenerInfografia = async (req, res) => {
  try {
    const { id } = req.params;
    const infografia = await Infografia.getById(id);
    
    if (!infografia) {
      return res.status(404).json({
        success: false,
        message: 'Infografía no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: infografia
    });
  } catch (error) {
    console.error('Error al obtener infografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener infografía',
      error: error.message
    });
  }
};

// Crear nueva infografía
exports.crearInfografia = async (req, res) => {
  try {
    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }
    
    const { titulo, descripcion, categoria_id, tags, autor } = req.body;
    
    // Validaciones
    if (!titulo || !categoria_id) {
      // Eliminar archivo si faltan datos
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Título y categoría son obligatorios'
      });
    }
    
    // Parsear tags si viene como string
    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    
    const data = {
      titulo,
      descripcion: descripcion || null,
      categoria_id: parseInt(categoria_id),
      tags: tagsArray,
      ruta_archivo: `/uploads/infografias/${req.file.filename}`,
      nombre_archivo: req.file.filename,
      tipo_archivo: req.file.mimetype,
      tamaño: req.file.size,
      autor: autor || req.body.autor,
      usuario_id: req.user?.id || req.usuario?.id || null
    };
    
    const infografiaId = await Infografia.create(data);
    
    res.status(201).json({
      success: true,
      message: 'Infografía creada exitosamente',
      data: { id: infografiaId }
    });
  } catch (error) {
    console.error('Error al crear infografía:', error);
    
    // Intentar eliminar el archivo si hubo error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear infografía',
      error: error.message
    });
  }
};

// Actualizar infografía
exports.actualizarInfografia = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria_id, tags, autor, activo } = req.body;
    
    // Verificar que la infografía existe (incluyendo inactivas para poder reactivarlas)
    const infografiaExistente = await Infografia.getById(id, true);
    
    if (!infografiaExistente) {
      return res.status(404).json({
        success: false,
        message: `Infografía con ID ${id} no encontrada`
      });
    }
    
    const data = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (categoria_id !== undefined) data.categoria_id = parseInt(categoria_id);
    if (tags !== undefined) {
      data.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (autor !== undefined) data.autor = autor;
    if (activo !== undefined) data.activo = parseInt(activo);
    
    const actualizado = await Infografia.update(id, data);
    
    if (!actualizado) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar la infografía'
      });
    }
    
    res.json({
      success: true,
      message: 'Infografía actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar infografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar infografía',
      error: error.message
    });
  }
};

// Eliminar infografía (soft delete)
exports.eliminarInfografia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eliminado = await Infografia.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Infografía no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Infografía eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar infografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar infografía',
      error: error.message
    });
  }
};

// Descargar infografía (incrementa contador)
exports.descargarInfografia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const infografia = await Infografia.getById(id);
    
    if (!infografia) {
      return res.status(404).json({
        success: false,
        message: 'Infografía no encontrada'
      });
    }
    
    // Incrementar contador de descargas
    await Infografia.incrementarDescargas(id);
    
    // Construir ruta completa del archivo
    const filePath = path.join(__dirname, '..', infografia.ruta_archivo);
    
    // Enviar archivo
    res.download(filePath, infografia.nombre_archivo, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
        res.status(500).json({
          success: false,
          message: 'Error al descargar archivo'
        });
      }
    });
  } catch (error) {
    console.error('Error al descargar infografía:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar infografía',
      error: error.message
    });
  }
};

// Obtener estadísticas
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Infografia.getEstadisticas();
    
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// ========== CATEGORÍAS ==========

// Listar todas las categorías
exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaInfografia.getAllWithCount();
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// Crear nueva categoría
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, color, icono, orden_visualizacion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }
    
    const categoriaId = await CategoriaInfografia.create({
      nombre,
      descripcion,
      color,
      icono,
      orden_visualizacion
    });
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { id: categoriaId }
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

// Actualizar categoría
exports.actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await CategoriaInfografia.update(id, req.body);
    
    if (!actualizado) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};
