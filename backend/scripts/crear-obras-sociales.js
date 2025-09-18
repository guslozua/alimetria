const { executeQuery } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function crearTablaObrasSociales() {
  try {
    console.log('🏥 Creando tabla obras_sociales...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'crear_obras_sociales.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir en consultas individuales (por punto y coma)
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log(`📝 Ejecutando ${queries.length} consultas SQL...`);
    
    // Ejecutar cada consulta
    for (const query of queries) {
      if (query.trim()) {
        console.log(`⚡ Ejecutando: ${query.substring(0, 50)}...`);
        await executeQuery(query);
      }
    }
    
    console.log('✅ Tabla obras_sociales creada exitosamente');
    console.log('✅ Datos de ejemplo insertados');
    
    // Verificar la creación
    const result = await executeQuery('SELECT COUNT(*) as count FROM obras_sociales');
    console.log(`📊 Total de obras sociales creadas: ${result[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creando tabla obras_sociales:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearTablaObrasSociales()
    .then(() => {
      console.log('🎉 Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { crearTablaObrasSociales };
