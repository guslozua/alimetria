const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento para archivos InBody
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear subdirectorio por fecha si no existe
    const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const destPath = path.join(uploadsDir, 'inbody', dateFolder);
    
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const pacienteId = req.body.pacienteId || 'unknown';
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Formato: inbody_pacienteID_timestamp_random.ext
    const filename = `inbody_${pacienteId}_${uniqueSuffix}${extension}`;
    
    cb(null, filename);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos para InBody
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/bmp',
    'image/tiff',
    'application/pdf'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Formatos válidos: JPEG, PNG, BMP, TIFF, PDF`), false);
  }
};

// Configuración principal de multer
const uploadInBody = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1 // Solo un archivo por vez
  }
});

// Middleware para fotos de pacientes
const storagePhotos = multer.diskStorage({
  destination: (req, file, cb) => {
    const pacienteId = req.params.pacienteId || req.body.pacienteId;
    const destPath = path.join(uploadsDir, 'fotos', `paciente_${pacienteId}`);
    
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `foto_${uniqueSuffix}${extension}`;
    
    cb(null, filename);
  }
});

const uploadPhotos = multer({
  storage: storagePhotos,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPEG y PNG para fotos de pacientes'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para fotos
    files: 5 // Hasta 5 fotos simultáneas
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Tamaño máximo: 10MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Máximo permitido: 1 archivo InBody'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivo: ' + error.message
        });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Utility para limpiar archivos antiguos
const cleanOldFiles = (daysOld = 30) => {
  const cleanupPath = path.join(uploadsDir, 'inbody');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  console.log(`🧹 Iniciando limpieza de archivos anteriores a ${cutoffDate.toDateString()}`);
  
  try {
    if (fs.existsSync(cleanupPath)) {
      const folders = fs.readdirSync(cleanupPath);
      
      folders.forEach(folder => {
        const folderPath = path.join(cleanupPath, folder);
        const folderDate = new Date(folder);
        
        if (folderDate < cutoffDate) {
          fs.rmSync(folderPath, { recursive: true, force: true });
          console.log(`🗑️ Carpeta eliminada: ${folder}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Error en limpieza de archivos:', error);
  }
};

module.exports = {
  uploadInBody: uploadInBody.single('imagen'),
  uploadPhotos: uploadPhotos.array('fotos', 5),
  handleMulterError,
  cleanOldFiles
};