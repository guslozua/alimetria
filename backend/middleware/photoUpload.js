const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Configuración de multer para fotos de perfil
const storage = multer.memoryStorage(); // Usar memoria para procesar con Sharp

const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    // Tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.'), false);
    }
  } else {
    cb(new Error('El archivo debe ser una imagen.'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Solo un archivo por vez
  }
});

// Middleware para procesar y guardar foto de perfil
const processProfilePhoto = async (req, res, next) => {
  try {
    console.log('🖼️ Iniciando processProfilePhoto middleware');
    console.log('📎 req.file:', req.file);
    console.log('📝 req.body:', req.body);
    
    if (!req.file) {
      console.log('❌ No se encontró req.file');
      return res.status(400).json({
        success: false,
        message: 'No se ha enviado ningún archivo'
      });
    }

    const pacienteId = req.body.paciente_id || req.params.id;
    if (!pacienteId) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente requerido'
      });
    }

    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../uploads/fotos-perfil');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = '.jpg'; // Siempre convertir a JPG para consistencia
    const filename = `paciente-${pacienteId}-${timestamp}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Procesar imagen con Sharp
    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(filepath);

    // Agregar información del archivo procesado al request
    req.processedFile = {
      filename: filename,
      path: filepath,
      pacienteId: pacienteId
    };

    next();
  } catch (error) {
    console.error('Error procesando foto de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando la imagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función para eliminar archivo de foto
const deleteProfilePhoto = async (filename) => {
  try {
    if (!filename) return true;
    
    const filepath = path.join(__dirname, '../uploads/fotos-perfil', filename);
    
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      console.log(`Foto eliminada: ${filename}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error eliminando foto:', error);
        throw error;
      }
      // Si el archivo no existe, no es un error
      console.log(`Foto no encontrada (ya eliminada): ${filename}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error en deleteProfilePhoto:', error);
    return false;
  }
};

module.exports = {
  upload: upload.single('foto_perfil'),
  processProfilePhoto,
  deleteProfilePhoto
};