const { executeQuery } = require('../config/database');

class ConfiguracionController {
  // Obtener todas las configuraciones
  async obtenerConfiguraciones(req, res) {
    try {
      const { categoria, es_publica, search } = req.query;
      
      let query = 'SELECT * FROM configuraciones WHERE 1=1';
      const params = [];
      
      // Filtro por categoría
      if (categoria) {
        query += ' AND categoria = ?';
        params.push(categoria);
      }
      
      // Filtro por visibilidad
      if (es_publica !== undefined) {
        query += ' AND es_publica = ?';
        params.push(es_publica === 'true' ? 1 : 0);
      }
      
      // Filtro de búsqueda
      if (search) {
        query += ' AND (clave LIKE ? OR descripcion LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      query += ' ORDER BY categoria, clave';
      
      const configuraciones = await executeQuery(query, params);
      
      // Parsear valores JSON
      configuraciones.forEach(config => {
        if (config.tipo === 'json' && config.valor) {
          try {
            config.valor = JSON.parse(config.valor);
          } catch (error) {
            console.warn(`Error parseando valor JSON de ${config.clave}:`, error);
          }
        } else if (config.tipo === 'boolean') {
          config.valor = config.valor === 'true';
        } else if (config.tipo === 'number') {
          config.valor = parseFloat(config.valor);
        }
      });
      
      res.json({
        success: true,
        data: configuraciones
      });
    } catch (error) {
      console.error('Error obteniendo configuraciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener configuraciones públicas (sin autenticación)
  async obtenerConfiguracionesPublicas(req, res) {
    try {
      const query = 'SELECT clave, valor, tipo FROM configuraciones WHERE es_publica = TRUE ORDER BY categoria, clave';
      const configuraciones = await executeQuery(query);
      
      // Convertir a objeto clave-valor
      const configObj = {};
      configuraciones.forEach(config => {
        let valor = config.valor;
        
        // Parsear según tipo
        if (config.tipo === 'json' && valor) {
          try {
            valor = JSON.parse(valor);
          } catch (error) {
            console.warn(`Error parseando valor JSON de ${config.clave}:`, error);
          }
        } else if (config.tipo === 'boolean') {
          valor = valor === 'true';
        } else if (config.tipo === 'number') {
          valor = parseFloat(valor);
        }
        
        configObj[config.clave] = valor;
      });
      
      res.json({
        success: true,
        data: configObj
      });
    } catch (error) {
      console.error('Error obteniendo configuraciones públicas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener configuración específica
  async obtenerConfiguracion(req, res) {
    try {
      const { clave } = req.params;
      
      const query = 'SELECT * FROM configuraciones WHERE clave = ?';
      const configuraciones = await executeQuery(query, [clave]);
      
      if (configuraciones.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }
      
      const config = configuraciones[0];
      
      // Parsear valor según tipo
      if (config.tipo === 'json' && config.valor) {
        try {
          config.valor = JSON.parse(config.valor);
        } catch (error) {
          console.warn(`Error parseando valor JSON de ${config.clave}:`, error);
        }
      } else if (config.tipo === 'boolean') {
        config.valor = config.valor === 'true';
      } else if (config.tipo === 'number') {
        config.valor = parseFloat(config.valor);
      }
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nueva configuración
  async crearConfiguracion(req, res) {
    try {
      const { clave, valor, tipo, descripcion, categoria, es_publica } = req.body;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear configuraciones'
        });
      }
      
      // Validaciones
      if (!clave || valor === undefined) {
        return res.status(400).json({
          success: false,
          message: 'La clave y el valor son obligatorios'
        });
      }
      
      // Verificar que la clave no existe
      const existeQuery = 'SELECT id FROM configuraciones WHERE clave = ?';
      const existe = await executeQuery(existeQuery, [clave]);
      if (existe.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una configuración con esta clave'
        });
      }
      
      // Validar tipos permitidos
      const tiposPermitidos = ['string', 'number', 'boolean', 'json'];
      const tipoFinal = tipo || 'string';
      if (!tiposPermitidos.includes(tipoFinal)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de configuración no válido'
        });
      }
      
      // Preparar valor según tipo
      let valorFinal = valor;
      try {
        if (tipoFinal === 'json' && typeof valor !== 'string') {
          valorFinal = JSON.stringify(valor);
        } else if (tipoFinal === 'boolean') {
          valorFinal = valor ? 'true' : 'false';
        } else if (tipoFinal === 'number') {
          valorFinal = valor.toString();
        } else {
          valorFinal = valor.toString();
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Error procesando el valor de la configuración'
        });
      }
      
      // Crear configuración
      const query = `
        INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_publica)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        clave,
        valorFinal,
        tipoFinal,
        descripcion || null,
        categoria || 'general',
        es_publica ? 1 : 0
      ]);
      
      // Obtener la configuración creada
      const configCreada = await executeQuery('SELECT * FROM configuraciones WHERE id = ?', [result.insertId]);
      const config = configCreada[0];
      
      // Parsear valor para la respuesta
      if (config.tipo === 'json' && config.valor) {
        config.valor = JSON.parse(config.valor);
      } else if (config.tipo === 'boolean') {
        config.valor = config.valor === 'true';
      } else if (config.tipo === 'number') {
        config.valor = parseFloat(config.valor);
      }
      
      res.status(201).json({
        success: true,
        message: 'Configuración creada exitosamente',
        data: config
      });
    } catch (error) {
      console.error('Error creando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar configuración
  async actualizarConfiguracion(req, res) {
    try {
      const { clave } = req.params;
      const { valor, descripcion, categoria, es_publica } = req.body;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar configuraciones'
        });
      }
      
      // Verificar que la configuración existe
      const existeQuery = 'SELECT * FROM configuraciones WHERE clave = ?';
      const existe = await executeQuery(existeQuery, [clave]);
      if (existe.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }
      
      const configActual = existe[0];
      
      // Preparar campos para actualizar
      const campos = [];
      const valores = [];
      
      if (valor !== undefined) {
        // Preparar valor según tipo
        let valorFinal = valor;
        try {
          if (configActual.tipo === 'json' && typeof valor !== 'string') {
            valorFinal = JSON.stringify(valor);
          } else if (configActual.tipo === 'boolean') {
            valorFinal = valor ? 'true' : 'false';
          } else if (configActual.tipo === 'number') {
            valorFinal = valor.toString();
          } else {
            valorFinal = valor.toString();
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Error procesando el valor de la configuración'
          });
        }
        
        campos.push('valor = ?');
        valores.push(valorFinal);
      }
      
      if (descripcion !== undefined) {
        campos.push('descripcion = ?');
        valores.push(descripcion);
      }
      
      if (categoria !== undefined) {
        campos.push('categoria = ?');
        valores.push(categoria);
      }
      
      if (es_publica !== undefined) {
        campos.push('es_publica = ?');
        valores.push(es_publica ? 1 : 0);
      }
      
      if (campos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }
      
      // Actualizar
      campos.push('fecha_actualizacion = NOW()');
      valores.push(clave);
      
      const updateQuery = `UPDATE configuraciones SET ${campos.join(', ')} WHERE clave = ?`;
      await executeQuery(updateQuery, valores);
      
      // Obtener configuración actualizada
      const configActualizada = await executeQuery('SELECT * FROM configuraciones WHERE clave = ?', [clave]);
      const config = configActualizada[0];
      
      // Parsear valor para la respuesta
      if (config.tipo === 'json' && config.valor) {
        config.valor = JSON.parse(config.valor);
      } else if (config.tipo === 'boolean') {
        config.valor = config.valor === 'true';
      } else if (config.tipo === 'number') {
        config.valor = parseFloat(config.valor);
      }
      
      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: config
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar múltiples configuraciones
  async actualizarMultiples(req, res) {
    try {
      const { configuraciones } = req.body;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar configuraciones'
        });
      }
      
      if (!Array.isArray(configuraciones) || configuraciones.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de configuraciones'
        });
      }
      
      const resultados = [];
      const errores = [];
      
      // Procesar cada configuración
      for (const config of configuraciones) {
        try {
          const { clave, valor } = config;
          
          if (!clave || valor === undefined) {
            errores.push({ clave, error: 'Clave y valor son obligatorios' });
            continue;
          }
          
          // Verificar que existe
          const existeQuery = 'SELECT * FROM configuraciones WHERE clave = ?';
          const existe = await executeQuery(existeQuery, [clave]);
          
          if (existe.length === 0) {
            errores.push({ clave, error: 'Configuración no encontrada' });
            continue;
          }
          
          const configActual = existe[0];
          
          // Preparar valor según tipo
          let valorFinal = valor;
          if (configActual.tipo === 'json' && typeof valor !== 'string') {
            valorFinal = JSON.stringify(valor);
          } else if (configActual.tipo === 'boolean') {
            valorFinal = valor ? 'true' : 'false';
          } else if (configActual.tipo === 'number') {
            valorFinal = valor.toString();
          } else {
            valorFinal = valor.toString();
          }
          
          // Actualizar
          const updateQuery = 'UPDATE configuraciones SET valor = ?, fecha_actualizacion = NOW() WHERE clave = ?';
          await executeQuery(updateQuery, [valorFinal, clave]);
          
          resultados.push({ clave, success: true });
        } catch (error) {
          errores.push({ clave: config.clave, error: error.message });
        }
      }
      
      res.json({
        success: true,
        message: `${resultados.length} configuraciones actualizadas`,
        data: {
          exitosos: resultados,
          errores: errores
        }
      });
    } catch (error) {
      console.error('Error actualizando múltiples configuraciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar configuración
  async eliminarConfiguracion(req, res) {
    try {
      const { clave } = req.params;
      
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar configuraciones'
        });
      }
      
      // Configuraciones protegidas del sistema
      const configuracionesProtegidas = [
        'sistema_version',
        'consultorio_nombre',
        'recordatorio_dias_previos',
        'max_file_size_mb',
        'formatos_imagen_permitidos'
      ];
      
      if (configuracionesProtegidas.includes(clave)) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar una configuración del sistema'
        });
      }
      
      // Verificar que existe
      const existeQuery = 'SELECT id FROM configuraciones WHERE clave = ?';
      const existe = await executeQuery(existeQuery, [clave]);
      if (existe.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }
      
      // Eliminar
      await executeQuery('DELETE FROM configuraciones WHERE clave = ?', [clave]);
      
      res.json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Probar configuración de email
  async probarEmail(req, res) {
    try {
      // Verificar permisos de admin
      if (req.user.rol_nombre !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para probar configuraciones de email'
        });
      }
      
      const { email_destino } = req.body;
      
      if (!email_destino) {
        return res.status(400).json({
          success: false,
          message: 'Email de destino es requerido'
        });
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_destino)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }
      
      // Importar emailService
      const emailService = require('../utils/emailService');
      
      // Enviar email de prueba
      const resultado = await emailService.enviarEmailPrueba(email_destino);
      
      if (resultado.disabled) {
        return res.json({
          success: false,
          message: 'Envío de emails está deshabilitado en la configuración del sistema',
          disabled: true
        });
      }
      
      if (resultado.success) {
        return res.json({
          success: true,
          message: `Email de prueba enviado exitosamente a ${email_destino}`,
          messageId: resultado.messageId
        });
      } else {
        return res.status(500).json({
          success: false,
          message: resultado.message || 'Error enviando email de prueba',
          error: resultado.error
        });
      }
      
    } catch (error) {
      console.error('Error en prueba de email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener categorías disponibles
  async obtenerCategorias(req, res) {
    try {
      const query = 'SELECT DISTINCT categoria FROM configuraciones ORDER BY categoria';
      const categorias = await executeQuery(query);
      
      res.json({
        success: true,
        data: categorias.map(c => c.categoria)
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ConfiguracionController();
