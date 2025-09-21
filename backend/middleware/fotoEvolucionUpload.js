const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para fotos de evolución
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JPG, PNG y WebP'), false);
    }
  }
}).single('foto_evolucion');

// Middleware para procesar fotos de evolución
const procesarFotoEvolucion = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    const { pacienteId } = req.body;
    
    if (!pacienteId) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente es requerido'
      });
    }

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const extension = '.jpg';
    const filename = `evolucion-paciente-${pacienteId}-${timestamp}-${randomNum}${extension}`;
    
    // Ruta donde se guardará la imagen
    const uploadDir = path.join(__dirname, '../uploads/fotos');
    const filepath = path.join(uploadDir, filename);
    
    // Asegurar que el directorio existe
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    // Procesar imagen con Sharp
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(filepath);
    
    console.log('Foto de evolución procesada exitosamente:', filename);
    
    // Agregar información del archivo procesado al request
    req.fotoEvolucion = {
      filename,
      filepath,
      pacienteId: parseInt(pacienteId)
    };
    
    next();
    
  } catch (error) {
    console.error('Error procesando foto de evolución:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la imagen',
      error: error.message
    });
  }
};

// Función para eliminar foto física del servidor
const eliminarFotoEvolucion = async (filename) => {
  try {
    const filepath = path.join(__dirname, '../uploads/fotos', filename);
    await fs.unlink(filepath);
    console.log('Foto de evolución eliminada:', filename);
    return true;
  } catch (error) {
    console.error('Error eliminando foto de evolución:', error);
    return false;
  }
};

module.exports = {
  upload,
  procesarFotoEvolucion,
  eliminarFotoEvolucion
};