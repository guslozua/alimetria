const { executeQuery } = require('../config/database');

async function testObrasSociales() {
  try {
    console.log('🧪 Testing obras sociales query...');
    
    // Prueba 1: Query básica
    const basicQuery = 'SELECT * FROM obras_sociales WHERE activo = TRUE LIMIT 5';
    const basicResult = await executeQuery(basicQuery);
    console.log('📋 Query básica (5 primeros):', basicResult);
    
    // Prueba 2: Query con COUNT 
    const countQuery = 'SELECT COUNT(*) as total FROM obras_sociales WHERE activo = TRUE';
    const countResult = await executeQuery(countQuery);
    console.log('🔢 Total de obras sociales activas:', countResult[0].total);
    
    // Prueba 3: Query con JOIN (como en el modelo)
    const joinQuery = `
      SELECT os.*, 
             COUNT(p.id) as pacientes_count
      FROM obras_sociales os
      LEFT JOIN pacientes p ON os.id = p.obra_social_id AND p.activo = TRUE
      WHERE os.activo = TRUE
      GROUP BY os.id
      ORDER BY os.nombre
      LIMIT 5
    `;
    const joinResult = await executeQuery(joinQuery);
    console.log('🔗 Query con JOIN (5 primeros):', joinResult);
    
    // Prueba 4: Verificar estructura de tabla
    const structureQuery = 'DESCRIBE obras_sociales';
    const structureResult = await executeQuery(structureQuery);
    console.log('🏗️ Estructura de tabla obras_sociales:', structureResult);
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Ejecutar test
testObrasSociales()
  .then(() => {
    console.log('✅ Test completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en test:', error);
    process.exit(1);
  });
