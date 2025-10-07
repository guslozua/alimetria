const { executeQuery } = require('../config/database');

const suplementosController = {
  // GET /api/suplementos - Listar todos con filtros
  async listar(req, res) {
    try {
      const { 
        categoria, 
        busqueda, 
        letra, 
        destacados, 
        activo = true,
        page = 1, 
        limit = 20 
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['s.activo = ?'];
      let params = [activo];
      
      // Filtro por categoría
      if (categoria && categoria !== 'all') {
        whereConditions.push('s.categoria_id = ?');
        params.push(categoria);
      }
      
      // Filtro por destacados
      if (destacados === 'true') {
        whereConditions.push('s.destacado = 1');
      }
      
      // Filtro por letra inicial
      if (letra) {
        whereConditions.push('s.nombre LIKE ?');
        params.push(`${letra}%`);
      }
      
      // Búsqueda de texto
      if (busqueda) {
        whereConditions.push('(s.nombre LIKE ? OR s.descripcion_corta LIKE ? OR s.para_que_sirve LIKE ?)');
        params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // Consulta principal con join de categoría
      const query = `
        SELECT 
          s.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          c.icono as categoria_icono
        FROM suplementos s
        LEFT JOIN categorias_suplementos c ON s.categoria_id = c.id
        WHERE ${whereClause}
        ORDER BY s.destacado DESC, s.popularidad_uso DESC, s.nombre ASC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      
      // Consulta para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM suplementos s
        WHERE ${whereClause}
      `;
      
      const countParams = params.slice(0, -2); // Remover limit y offset

      const [suplementos, countResult] = await Promise.all([
        executeQuery(query, params),
        executeQuery(countQuery, countParams)
      ]);

      const total = countResult[0].total;

      res.json({
        success: true,
        data: suplementos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error al listar suplementos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /api/suplementos/:id - Obtener detalle completo
  async obtenerDetalle(req, res) {
    try {
      const { id } = req.params;
      
      // Consulta principal del suplemento
      const suplementoQuery = `
        SELECT 
          s.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          c.icono as categoria_icono
        FROM suplementos s
        LEFT JOIN categorias_suplementos c ON s.categoria_id = c.id
        WHERE s.id = ? AND s.activo = 1
      `;

      // Consultas relacionadas
      const indicacionesQuery = `
        SELECT * FROM suplemento_indicaciones 
        WHERE suplemento_id = ? AND activo = 1 
        ORDER BY nivel_recomendacion DESC, indicacion ASC
      `;

      const contraindicacionesQuery = `
        SELECT * FROM suplemento_contraindicaciones 
        WHERE suplemento_id = ? AND activo = 1 
        ORDER BY severidad DESC, tipo ASC
      `;

      const interaccionesQuery = `
        SELECT * FROM suplemento_interacciones 
        WHERE suplemento_id = ? AND activo = 1 
        ORDER BY severidad DESC, tipo_interaccion ASC
      `;

      const referenciasQuery = `
        SELECT * FROM suplemento_referencias 
        WHERE suplemento_id = ? AND activo = 1 
        ORDER BY año_publicacion DESC, calidad_evidencia DESC
      `;

      // Ejecutar todas las consultas en paralelo
      const [
        suplementoResult,
        indicaciones,
        contraindicaciones,
        interacciones,
        referencias
      ] = await Promise.all([
        executeQuery(suplementoQuery, [id]),
        executeQuery(indicacionesQuery, [id]),
        executeQuery(contraindicacionesQuery, [id]),
        executeQuery(interaccionesQuery, [id]),
        executeQuery(referenciasQuery, [id])
      ]);

      if (suplementoResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Suplemento no encontrado'
        });
      }

      const suplemento = suplementoResult[0];

      // Incrementar popularidad
      await executeQuery(
        'UPDATE suplementos SET popularidad_uso = popularidad_uso + 1 WHERE id = ?',
        [id]
      );

      // Combinar toda la información
      const suplementoCompleto = {
        ...suplemento,
        indicaciones,
        contraindicaciones,
        interacciones,
        referencias
      };

      res.json({
        success: true,
        data: suplementoCompleto
      });
    } catch (error) {
      console.error('Error al obtener detalle del suplemento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /api/suplementos/categorias - Listar categorías
  async listarCategorias(req, res) {
    try {
      const query = `
        SELECT 
          c.*,
          COUNT(s.id) as total_suplementos
        FROM categorias_suplementos c
        LEFT JOIN suplementos s ON c.id = s.categoria_id AND s.activo = 1
        WHERE c.activo = 1
        GROUP BY c.id
        ORDER BY c.orden_visualizacion ASC, c.nombre ASC
      `;

      const categorias = await executeQuery(query);

      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error al listar categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /api/suplementos/busqueda-inteligente
  async busquedaInteligente(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 3) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Búsqueda en múltiples campos con relevancia
      const query = `
        SELECT 
          s.*,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          c.icono as categoria_icono,
          (
            CASE 
              WHEN s.nombre LIKE ? THEN 10
              WHEN s.descripcion_corta LIKE ? THEN 5
              WHEN s.para_que_sirve LIKE ? THEN 3
              ELSE 1
            END
          ) as relevancia
        FROM suplementos s
        LEFT JOIN categorias_suplementos c ON s.categoria_id = c.id
        WHERE s.activo = 1 
        AND (
          s.nombre LIKE ? OR 
          s.descripcion_corta LIKE ? OR 
          s.para_que_sirve LIKE ?
        )
        ORDER BY relevancia DESC, s.popularidad_uso DESC, s.destacado DESC
        LIMIT 10
      `;

      const searchTerm = `%${q}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
      
      const suplementos = await executeQuery(query, params);

      res.json({
        success: true,
        data: suplementos
      });
    } catch (error) {
      console.error('Error en búsqueda inteligente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /api/suplementos/dashboard
  async dashboard(req, res) {
    try {
      // Consultas para estadísticas del dashboard
      const queries = {
        totalSupplementos: 'SELECT COUNT(*) as total FROM suplementos WHERE activo = 1',
        totalCategorias: 'SELECT COUNT(*) as total FROM categorias_suplementos WHERE activo = 1',
        destacados: `
          SELECT s.*, c.nombre as categoria_nombre, c.color as categoria_color, c.icono as categoria_icono
          FROM suplementos s
          LEFT JOIN categorias_suplementos c ON s.categoria_id = c.id
          WHERE s.activo = 1 AND s.destacado = 1
          ORDER BY s.popularidad_uso DESC
          LIMIT 6
        `,
        masPopulares: `
          SELECT s.*, c.nombre as categoria_nombre, c.color as categoria_color, c.icono as categoria_icono
          FROM suplementos s
          LEFT JOIN categorias_suplementos c ON s.categoria_id = c.id
          WHERE s.activo = 1
          ORDER BY s.popularidad_uso DESC
          LIMIT 5
        `
      };

      const [
        totalSupplementosResult,
        totalCategoriasResult,
        destacados,
        masPopulares
      ] = await Promise.all([
        executeQuery(queries.totalSupplementos),
        executeQuery(queries.totalCategorias),
        executeQuery(queries.destacados),
        executeQuery(queries.masPopulares)
      ]);

      res.json({
        success: true,
        data: {
          estadisticas: {
            total_suplementos: totalSupplementosResult[0].total,
            total_categorias: totalCategoriasResult[0].total
          },
          destacados,
          mas_populares: masPopulares
        }
      });
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // POST /api/suplementos - Crear nuevo suplemento
  async crear(req, res) {
    try {
      const {
        nombre,
        nombre_cientifico,
        categoria_id,
        descripcion_corta,
        descripcion_detallada,
        para_que_sirve,
        beneficios_principales,
        dosis_recomendada,
        dosis_minima,
        dosis_maxima,
        forma_presentacion,
        frecuencia_recomendada,
        mejor_momento_toma,
        duracion_tratamiento_tipica,
        nivel_evidencia,
        destacado,
        // Datos relacionados
        indicaciones,
        contraindicaciones,
        efectos_secundarios,
        interacciones,
        referencias
      } = req.body;

      // Validaciones básicas
      if (!nombre || !categoria_id) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y la categoría son obligatorios'
        });
      }

      // Convertir beneficios a JSON
      const beneficiosJSON = Array.isArray(beneficios_principales) 
        ? JSON.stringify(beneficios_principales)
        : beneficios_principales;

      // Insertar suplemento principal
      const insertQuery = `
        INSERT INTO suplementos (
          nombre, nombre_cientifico, categoria_id, descripcion_corta, 
          descripcion_detallada, para_que_sirve, beneficios_principales,
          dosis_recomendada, dosis_minima, dosis_maxima, forma_presentacion,
          frecuencia_recomendada, mejor_momento_toma, duracion_tratamiento_tipica,
          nivel_evidencia, destacado, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;

      const result = await executeQuery(insertQuery, [
        nombre,
        nombre_cientifico || null,
        categoria_id,
        descripcion_corta || null,
        descripcion_detallada || null,
        para_que_sirve || null,
        beneficiosJSON || null,
        dosis_recomendada || null,
        dosis_minima || null,
        dosis_maxima || null,
        forma_presentacion || 'cápsula',
        frecuencia_recomendada || null,
        mejor_momento_toma || null,
        duracion_tratamiento_tipica || null,
        nivel_evidencia || 'media',
        destacado || 0
      ]);

      const suplementoId = result.insertId;

      // Insertar indicaciones
      if (indicaciones && indicaciones.length > 0) {
        const indicacionesQuery = `
          INSERT INTO suplemento_indicaciones 
          (suplemento_id, indicacion, perfil_paciente, nivel_recomendacion, notas_adicionales)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const ind of indicaciones) {
          await executeQuery(indicacionesQuery, [
            suplementoId,
            ind.indicacion,
            ind.perfil_paciente || null,
            ind.nivel_recomendacion || 'media',
            ind.notas_adicionales || null
          ]);
        }
      }

      // Insertar contraindicaciones
      if (contraindicaciones && contraindicaciones.length > 0) {
        const contraindicacionesQuery = `
          INSERT INTO suplemento_contraindicaciones 
          (suplemento_id, tipo, descripcion, poblacion_afectada, severidad)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const contra of contraindicaciones) {
          await executeQuery(contraindicacionesQuery, [
            suplementoId,
            contra.tipo || 'precaucion',
            contra.descripcion,
            contra.poblacion_afectada || null,
            contra.severidad || 'media'
          ]);
        }
      }

      // Insertar efectos secundarios
      if (efectos_secundarios && efectos_secundarios.length > 0) {
        const efectosQuery = `
          INSERT INTO suplemento_efectos_secundarios 
          (suplemento_id, efecto_secundario, frecuencia, descripcion, manejo_recomendado)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const efecto of efectos_secundarios) {
          await executeQuery(efectosQuery, [
            suplementoId,
            efecto.efecto_secundario,
            efecto.frecuencia || 'poco_común',
            efecto.descripcion || null,
            efecto.manejo_recomendado || null
          ]);
        }
      }

      // Insertar interacciones
      if (interacciones && interacciones.length > 0) {
        const interaccionesQuery = `
          INSERT INTO suplemento_interacciones 
          (suplemento_id, tipo_interaccion, nombre_interaccion, descripcion_interaccion, severidad, recomendacion)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        for (const inter of interacciones) {
          await executeQuery(interaccionesQuery, [
            suplementoId,
            inter.tipo_interaccion,
            inter.nombre_interaccion,
            inter.descripcion_interaccion || null,
            inter.severidad || 'moderada',
            inter.recomendacion || null
          ]);
        }
      }

      // Insertar referencias
      if (referencias && referencias.length > 0) {
        const referenciasQuery = `
          INSERT INTO suplemento_referencias 
          (suplemento_id, titulo_estudio, autores, revista_publicacion, año_publicacion, 
           tipo_estudio, url_referencia, resumen_hallazgos, calidad_evidencia)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const ref of referencias) {
          await executeQuery(referenciasQuery, [
            suplementoId,
            ref.titulo_estudio || null,
            ref.autores || null,
            ref.revista_publicacion || null,
            ref.año_publicacion || null,
            ref.tipo_estudio || 'observacional',
            ref.url_referencia || null,
            ref.resumen_hallazgos || null,
            ref.calidad_evidencia || 'moderada'
          ]);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Suplemento creado exitosamente',
        data: {
          id: suplementoId
        }
      });
    } catch (error) {
      console.error('Error al crear suplemento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el suplemento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // PUT /api/suplementos/:id - Actualizar suplemento
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        nombre_cientifico,
        categoria_id,
        descripcion_corta,
        descripcion_detallada,
        para_que_sirve,
        beneficios_principales,
        dosis_recomendada,
        dosis_minima,
        dosis_maxima,
        forma_presentacion,
        frecuencia_recomendada,
        mejor_momento_toma,
        duracion_tratamiento_tipica,
        nivel_evidencia,
        destacado,
        activo
      } = req.body;

      // Verificar que el suplemento existe
      const existeQuery = 'SELECT id FROM suplementos WHERE id = ?';
      const [existe] = await executeQuery(existeQuery, [id]);
      
      if (!existe) {
        return res.status(404).json({
          success: false,
          message: 'Suplemento no encontrado'
        });
      }

      // Convertir beneficios a JSON si es necesario
      const beneficiosJSON = Array.isArray(beneficios_principales) 
        ? JSON.stringify(beneficios_principales)
        : beneficios_principales;

      // Actualizar suplemento principal
      const updateQuery = `
        UPDATE suplementos SET
          nombre = ?,
          nombre_cientifico = ?,
          categoria_id = ?,
          descripcion_corta = ?,
          descripcion_detallada = ?,
          para_que_sirve = ?,
          beneficios_principales = ?,
          dosis_recomendada = ?,
          dosis_minima = ?,
          dosis_maxima = ?,
          forma_presentacion = ?,
          frecuencia_recomendada = ?,
          mejor_momento_toma = ?,
          duracion_tratamiento_tipica = ?,
          nivel_evidencia = ?,
          destacado = ?,
          activo = ?
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [
        nombre,
        nombre_cientifico || null,
        categoria_id,
        descripcion_corta || null,
        descripcion_detallada || null,
        para_que_sirve || null,
        beneficiosJSON || null,
        dosis_recomendada || null,
        dosis_minima || null,
        dosis_maxima || null,
        forma_presentacion || 'cápsula',
        frecuencia_recomendada || null,
        mejor_momento_toma || null,
        duracion_tratamiento_tipica || null,
        nivel_evidencia || 'media',
        destacado || 0,
        activo !== undefined ? activo : 1,
        id
      ]);

      res.json({
        success: true,
        message: 'Suplemento actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar suplemento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el suplemento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // DELETE /api/suplementos/:id - Eliminar suplemento (soft delete)
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el suplemento existe
      const existeQuery = 'SELECT id FROM suplementos WHERE id = ?';
      const [existe] = await executeQuery(existeQuery, [id]);
      
      if (!existe) {
        return res.status(404).json({
          success: false,
          message: 'Suplemento no encontrado'
        });
      }

      // Soft delete - marcar como inactivo
      const deleteQuery = 'UPDATE suplementos SET activo = 0 WHERE id = ?';
      await executeQuery(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Suplemento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar suplemento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el suplemento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = suplementosController;
