const fs = require('fs');
const path = require('path');

/**
 * Script de inicialización del módulo de Infografías
 * Crea las carpetas necesarias para el almacenamiento de archivos
 */

const createDirectories = () => {
  const directories = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'uploads', 'infografias')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Directorio creado: ${dir}`);
    } else {
      console.log(`✓ Directorio ya existe: ${dir}`);
    }
  });
};

const main = () => {
  console.log('🚀 Inicializando módulo de Infografías...\n');
  
  try {
    createDirectories();
    console.log('\n✅ Módulo de Infografías inicializado correctamente');
    console.log('\nPróximos pasos:');
    console.log('1. Verifica que las tablas estén creadas en la base de datos');
    console.log('2. Inicia el servidor: npm start');
    console.log('3. Accede a la galería desde el frontend\n');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
};

main();
