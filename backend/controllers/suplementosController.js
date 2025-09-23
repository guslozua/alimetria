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
  }
};

module.exports = suplementosController;
