const express = require('express');
const { pool } = require('./config/database');

// Script para probar las funcionalidades de citas
async function testCitas() {
  console.log('🧪 === PRUEBA DEL SISTEMA DE CITAS ===\n');

  try {
    // 1. Verificar que exista la tabla citas
    console.log('1️⃣ Verificando estructura de tabla citas...');
    const [tableInfo] = await pool.execute('DESCRIBE citas');
    console.log('✅ Tabla citas encontrada con estructura:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(opcional)' : '(requerido)'}`);
    });

    // 2. Verificar que existan pacientes y usuarios para las pruebas
    console.log('\n2️⃣ Verificando datos de prueba...');
    const [pacientes] = await pool.execute('SELECT id, nombre, apellido FROM pacientes LIMIT 3');
    const [nutricionistas] = await pool.execute('SELECT id, nombre FROM usuarios WHERE rol_id IN (1, 2) LIMIT 2');
    
    console.log(`✅ Pacientes disponibles: ${pacientes.length}`);
    pacientes.forEach(p => console.log(`   - ${p.id}: ${p.nombre} ${p.apellido}`));
    
    console.log(`✅ Nutricionistas disponibles: ${nutricionistas.length}`);
    nutricionistas.forEach(n => console.log(`   - ${n.id}: ${n.nombre}`));

    // 3. Crear citas de prueba
    console.log('\n3️⃣ Creando citas de prueba...');
    
    if (pacientes.length > 0 && nutricionistas.length > 0) {
      // Cita de prueba 1 - Para mañana
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      mañana.setHours(10, 0, 0, 0);

      await pool.execute(`
        INSERT INTO citas (
          paciente_id, nutricionista_id, fecha_hora, duracion_minutos,
          tipo_consulta, estado, motivo, notas_previas, consultorio_id, usuario_creador_id
        ) VALUES (?, ?, ?, 60, 'seguimiento', 'programada', 'Control mensual', 'Paciente refiere mejora en hábitos alimentarios', 1, ?)
      `, [pacientes[0].id, nutricionistas[0].id, mañana, nutricionistas[0].id]);

      // Cita de prueba 2 - Para pasado mañana
      const pasadoMañana = new Date();
      pasadoMañana.setDate(pasadoMañana.getDate() + 2);
      pasadoMañana.setHours(14, 30, 0, 0);

      await pool.execute(`
        INSERT INTO citas (
          paciente_id, nutricionista_id, fecha_hora, duracion_minutos,
          tipo_consulta, estado, motivo, consultorio_id, usuario_creador_id
        ) VALUES (?, ?, ?, 45, 'primera_vez', 'confirmada', 'Evaluación inicial', 1, ?)
      `, [pacientes[1] ? pacientes[1].id : pacientes[0].id, nutricionistas[0].id, pasadoMañana, nutricionistas[0].id]);

      console.log('✅ Citas de prueba creadas exitosamente');
    } else {
      console.log('⚠️ No hay suficientes datos para crear citas de prueba');
    }

    // 4. Verificar citas creadas
    console.log('\n4️⃣ Verificando citas creadas...');
    const [citas] = await pool.execute(`
      SELECT 
        c.id, 
        CONCAT(p.nombre, ' ', p.apellido) as paciente,
        u.nombre as nutricionista,
        c.fecha_hora,
        c.tipo_consulta,
        c.estado
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.nutricionista_id = u.id
      ORDER BY c.fecha_hora DESC
      LIMIT 5
    `);

    if (citas.length > 0) {
      console.log(`✅ Citas encontradas: ${citas.length}`);
      citas.forEach(c => {
        const fecha = new Date(c.fecha_hora).toLocaleString('es-AR');
        console.log(`   - ID ${c.id}: ${c.paciente} con ${c.nutricionista} - ${fecha} (${c.estado})`);
      });
    } else {
      console.log('⚠️ No se encontraron citas');
    }

    // 5. Verificar endpoints API
    console.log('\n5️⃣ URLs disponibles para probar:');
    console.log('   GET  http://localhost:5001/api/citas - Listar citas');
    console.log('   GET  http://localhost:5001/api/citas/proximas - Próximas citas');
    console.log('   GET  http://localhost:5001/api/citas/calendario - Para calendario');
    console.log('   GET  http://localhost:5001/api/citas/estadisticas - Estadísticas');
    console.log('   POST http://localhost:5001/api/citas - Crear cita');
    console.log('   PUT  http://localhost:5001/api/citas/:id - Actualizar cita');
    console.log('   PATCH http://localhost:5001/api/citas/:id/cancelar - Cancelar cita');
    console.log('   PATCH http://localhost:5001/api/citas/:id/completar - Completar cita');

    console.log('\n✅ === SISTEMA DE CITAS LISTO PARA USAR ===');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

module.exports = { testCitas };

// Si se ejecuta directamente
if (require.main === module) {
  testCitas().then(() => process.exit(0));
}
