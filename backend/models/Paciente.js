const { executeQuery } = require('../config/database');

class Paciente {
  constructor(data = {}) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.sexo = data.sexo;
    this.fecha_nacimiento = data.fecha_nacimiento;
    this.telefono = data.telefono;
    this.email = data.email;
    this.direccion = data.direccion;
    this.ocupacion = data.ocupacion;
    this.foto_perfil = data.foto_perfil;
    this.altura_inicial = data.altura_inicial;
    this.peso_inicial = data.peso_inicial;
    this.objetivo = data.objetivo;
    this.observaciones_generales = data.observaciones_generales;
    this.obra_social_id = data.obra_social_id;
    this.numero_afiliado = data.numero_afiliado;
    this.consultorio_id = data.consultorio_id;
    this.usuario_creador_id = data.usuario_creador_id;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
    
    // Campos calculados
    this.edad = data.edad;
    this.creador_nombre = data.creador_nombre;
    this.consultorio_nombre = data.consultorio_nombre;
    this.obra_social_nombre = data.obra_social_nombre;
    this.obra_social_codigo = data.obra_social_codigo;
    this.ultima_medicion_fecha = data.ultima_medicion_fecha;
    this.ultimo_peso = data.ultimo_peso;
    this.ultimo_imc = data.ultimo_imc;
    this.total_mediciones = data.total_mediciones;
  }

  // Obtener todos los pacientes con información adicional
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT 
          p.*,
          u.nombre as creador_nombre,
          c.nombre as consultorio_nombre,
          os.nombre as obra_social_nombre,
          os.codigo as obra_social_codigo,
          m.fecha_medicion as ultima_medicion_fecha,
          m.peso as ultimo_peso,
          m.imc as ultimo_imc,
          COUNT(med.id) as total_mediciones,
          TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
        FROM pacientes p
        LEFT JOIN usuarios u ON p.usuario_creador_id = u.id
        LEFT JOIN consultorios c ON p.consultorio_id = c.id
        LEFT JOIN obras_sociales os ON p.obra_social_id = os.id
        LEFT JOIN mediciones m ON p.id = m.paciente_id AND m.fecha_medicion = (
          SELECT MAX(fecha_medicion) 
          FROM mediciones m2 
          WHERE m2.paciente_id = p.id AND m2.activo = TRUE
        )
        LEFT JOIN mediciones med ON p.id = med.paciente_id AND med.activo = TRUE
        WHERE p.activo = TRUE
      `;
      const values = [];

      // Filtros
      if (filters.consultorio_id) {
        query += ' AND p.consultorio_id = ?';
        values.push(filters.consultorio_id);
      }

      if (filters.sexo) {
        query += ' AND p.sexo = ?';
        values.push(filters.sexo);
      }

      if (filters.search) {
        query += ' AND (p.nombre LIKE ? OR p.apellido LIKE ? OR p.email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.edad_min) {
        query += ' AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= ?';
        values.push(filters.edad_min);
      }

      if (filters.edad_max) {
        query += ' AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) <= ?';
        values.push(filters.edad_max);
      }

      query += ' GROUP BY p.id';

      // Ordenamiento
      const orderBy = filters.orderBy || 'p.nombre';
      const orderDirection = filters.orderDirection || 'ASC';
      query += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Paginación
      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          values.push(parseInt(filters.offset));
        }
      }

      const results = await executeQuery(query, values);
      return results.map(paciente => new Paciente(paciente));
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      throw error;
    }
  }

  // Buscar paciente por ID
  static async findById(id) {
    try {
      const query = `
        SELECT 
          p.*,
          u.nombre as creador_nombre,
          c.nombre as consultorio_nombre,
          os.nombre as obra_social_nombre,
          os.codigo as obra_social_codigo,
          m.peso as ultimo_peso,
          m.imc as ultimo_imc,
          m.fecha_medicion as ultima_medicion_fecha,
          TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
        FROM pacientes p
        LEFT JOIN usuarios u ON p.usuario_creador_id = u.id
        LEFT JOIN consultorios c ON p.consultorio_id = c.id
        LEFT JOIN obras_sociales os ON p.obra_social_id = os.id
        LEFT JOIN mediciones m ON p.id = m.paciente_id AND m.fecha_medicion = (
          SELECT MAX(fecha_medicion) 
          FROM mediciones m2 
          WHERE m2.paciente_id = p.id AND m2.activo = TRUE
        )
        WHERE p.id = ? AND p.activo = TRUE
      `;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Paciente(results[0]) : null;
    } catch (error) {
      console.error('Error buscando paciente por ID:', error);
      throw error;
    }
  }

  // Crear nuevo paciente
  static async create(pacienteData) {
    try {
      const query = `
        INSERT INTO pacientes (
          nombre, apellido, sexo, fecha_nacimiento, telefono, email, 
          direccion, ocupacion, altura_inicial, peso_inicial, objetivo, 
          observaciones_generales, obra_social_id, numero_afiliado, consultorio_id, usuario_creador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        pacienteData.nombre,
        pacienteData.apellido,
        pacienteData.sexo,
        pacienteData.fecha_nacimiento,
        pacienteData.telefono || null,
        pacienteData.email || null,
        pacienteData.direccion || null,
        pacienteData.ocupacion || null,
        pacienteData.altura_inicial || null,
        pacienteData.peso_inicial || null,
        pacienteData.objetivo || null,
        pacienteData.observaciones_generales || null,
        pacienteData.obra_social_id || null,
        pacienteData.numero_afiliado || null,
        pacienteData.consultorio_id || null,
        pacienteData.usuario_creador_id
      ];
      
      const result = await executeQuery(query, values);
      return await Paciente.findById(result.insertId);
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  }

  // Actualizar paciente
  async update(updateData) {
    try {
      const fields = [];
      const values = [];

      // Campos que se pueden actualizar
      const allowedFields = [
        'nombre', 'apellido', 'sexo', 'fecha_nacimiento', 'telefono', 'email', 'direccion', 
        'ocupacion', 'altura_inicial', 'peso_inicial', 'objetivo', 
        'observaciones_generales', 'obra_social_id', 'numero_afiliado', 'foto_perfil'
      ];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(this.id);
      const query = `UPDATE pacientes SET ${fields.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`;
      
      await executeQuery(query, values);
      return await Paciente.findById(this.id);
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      throw error;
    }
  }

  // Desactivar paciente (soft delete)
  async deactivate() {
    try {
      const query = 'UPDATE pacientes SET activo = FALSE, fecha_actualizacion = NOW() WHERE id = ?';
      await executeQuery(query, [this.id]);
      this.activo = false;
    } catch (error) {
      console.error('Error desactivando paciente:', error);
      throw error;
    }
  }

  // Verificar si email ya existe
  static async emailExists(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM pacientes WHERE email = ? AND activo = TRUE';
      const values = [email];

      if (excludeId) {
        query += ' AND id != ?';
        values.push(excludeId);
      }

      const results = await executeQuery(query, values);
      return results.length > 0;
    } catch (error) {
      console.error('Error verificando email:', error);
      throw error;
    }
  }

  // Obtener mediciones del paciente
  async getMediciones(limit = null) {
    try {
      let query = `
        SELECT m.*, u.nombre as usuario_nombre
        FROM mediciones m
        LEFT JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.paciente_id = ? AND m.activo = TRUE
        ORDER BY m.fecha_medicion DESC
      `;
      const values = [this.id];

      if (limit) {
        query += ' LIMIT ?';
        values.push(limit);
      }

      return await executeQuery(query, values);
    } catch (error) {
      console.error('Error obteniendo mediciones del paciente:', error);
      throw error;
    }
  }

  // Obtener fotos del paciente
  async getFotos(limit = null) {
    try {
      let query = `
        SELECT f.*, u.nombre as usuario_nombre
        FROM fotos_pacientes f
        LEFT JOIN usuarios u ON f.usuario_id = u.id
        WHERE f.paciente_id = ? AND f.activo = TRUE
        ORDER BY f.fecha DESC
      `;
      const values = [this.id];

      if (limit) {
        query += ' LIMIT ?';
        values.push(limit);
      }

      return await executeQuery(query, values);
    } catch (error) {
      console.error('Error obteniendo fotos del paciente:', error);
      throw error;
    }
  }

  // Obtener citas del paciente
  async getCitas(includeCompleted = true) {
    try {
      let query = `
        SELECT c.*, u.nombre as nutricionista_nombre
        FROM citas c
        LEFT JOIN usuarios u ON c.nutricionista_id = u.id
        WHERE c.paciente_id = ?
      `;
      const values = [this.id];

      if (!includeCompleted) {
        query += ' AND c.estado NOT IN ("completada", "cancelada")';
      }

      query += ' ORDER BY c.fecha_hora DESC';

      return await executeQuery(query, values);
    } catch (error) {
      console.error('Error obteniendo citas del paciente:', error);
      throw error;
    }
  }

  // Obtener estadísticas del paciente
  async getEstadisticas() {
    try {
      const estadisticas = {
        total_mediciones: 0,
        peso_inicial: this.peso_inicial,
        peso_actual: null,
        diferencia_peso: null,
        imc_actual: null,
        grasa_corporal_actual: null,
        musculo_actual: null,
        proxima_cita: null,
        total_fotos: 0
      };

      // Obtener última medición
      const ultimaMedicion = await executeQuery(`
        SELECT * FROM mediciones 
        WHERE paciente_id = ? AND activo = TRUE 
        ORDER BY fecha_medicion DESC 
        LIMIT 1
      `, [this.id]);

      if (ultimaMedicion.length > 0) {
        const medicion = ultimaMedicion[0];
        estadisticas.peso_actual = medicion.peso;
        estadisticas.imc_actual = medicion.imc;
        estadisticas.grasa_corporal_actual = medicion.grasa_corporal;
        estadisticas.musculo_actual = medicion.musculo;
        
        if (this.peso_inicial && medicion.peso) {
          estadisticas.diferencia_peso = medicion.peso - this.peso_inicial;
        }
      }

      // Contar mediciones
      const countMediciones = await executeQuery(`
        SELECT COUNT(*) as total FROM mediciones 
        WHERE paciente_id = ? AND activo = TRUE
      `, [this.id]);
      estadisticas.total_mediciones = countMediciones[0].total;

      // Contar fotos
      const countFotos = await executeQuery(`
        SELECT COUNT(*) as total FROM fotos_pacientes 
        WHERE paciente_id = ? AND activo = TRUE
      `, [this.id]);
      estadisticas.total_fotos = countFotos[0].total;

      // Próxima cita
      const proximaCita = await executeQuery(`
        SELECT * FROM citas 
        WHERE paciente_id = ? AND fecha_hora > NOW() AND estado IN ('programada', 'confirmada')
        ORDER BY fecha_hora ASC 
        LIMIT 1
      `, [this.id]);

      if (proximaCita.length > 0) {
        estadisticas.proxima_cita = proximaCita[0];
      }

      return estadisticas;
    } catch (error) {
      console.error('Error obteniendo estadísticas del paciente:', error);
      throw error;
    }
  }

  // Obtener resumen para listado
  toListSummary() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      sexo: this.sexo,
      edad: this.edad,
      email: this.email,
      telefono: this.telefono,
      foto_perfil: this.foto_perfil,
      ultimo_peso: this.ultimo_peso,
      ultimo_imc: this.ultimo_imc,
      ultima_medicion_fecha: this.ultima_medicion_fecha,
      total_mediciones: this.total_mediciones,
      fecha_creacion: this.fecha_creacion
    };
  }
}

module.exports = Paciente;
