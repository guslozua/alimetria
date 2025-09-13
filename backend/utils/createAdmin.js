const bcrypt = require('bcryptjs');
const { executeQuery, createDatabase, testConnection } = require('../config/database');

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador inicial...');

    // Verificar conexión
    await createDatabase();
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Verificar si ya existe un administrador
    const existingAdmin = await executeQuery(
      'SELECT u.* FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE r.nombre = "administrador" AND u.activo = TRUE LIMIT 1'
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Ya existe un usuario administrador:');
      console.log(`📧 Email: ${existingAdmin[0].email}`);
      console.log(`👤 Nombre: ${existingAdmin[0].nombre} ${existingAdmin[0].apellido}`);
      return;
    }

    // Obtener el rol de administrador
    const adminRole = await executeQuery('SELECT * FROM roles WHERE nombre = "administrador" LIMIT 1');
    if (adminRole.length === 0) {
      throw new Error('No se encontró el rol de administrador en la base de datos');
    }

    // Obtener el consultorio por defecto
    const consultorio = await executeQuery('SELECT * FROM consultorios WHERE activo = TRUE LIMIT 1');
    if (consultorio.length === 0) {
      throw new Error('No se encontró un consultorio activo en la base de datos');
    }

    // Datos del administrador por defecto
    const adminData = {
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@alimetria.com',
      password: 'Admin123!',  // Contraseña temporal
      telefono: '(000) 000-0000',
      rol_id: adminRole[0].id,
      consultorio_id: consultorio[0].id
    };

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Crear usuario administrador
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id, consultorio_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      adminData.nombre,
      adminData.apellido,
      adminData.email,
      hashedPassword,
      adminData.telefono,
      adminData.rol_id,
      adminData.consultorio_id
    ]);

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Contraseña: ${adminData.password}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer acceso');
    console.log('');
    console.log('🌐 Puedes acceder al sistema en:');
    console.log('   Frontend: http://localhost:3001');
    console.log('   Backend:  http://localhost:5001');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('🎉 Usuario administrador configurado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = createAdminUser;
