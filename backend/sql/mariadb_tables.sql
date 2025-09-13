-- =========================================
-- ALIMETRIA - SISTEMA DE CONSULTORIO DE NUTRICIÓN
-- Script de creación de base de datos (Compatible MariaDB/XAMPP)
-- Versión: 1.0.0 MariaDB
-- Fecha: Septiembre 2025
-- =========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS alimetria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alimetria;

-- =========================================
-- TABLA: roles
-- =========================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos TEXT COMMENT 'Permisos específicos del rol en formato JSON',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- TABLA: consultorios
-- =========================================
CREATE TABLE IF NOT EXISTS consultorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    configuracion TEXT COMMENT 'Configuraciones específicas del consultorio',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- TABLA: usuarios
-- =========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    foto_perfil VARCHAR(255),
    rol_id INT NOT NULL,
    consultorio_id INT,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso DATETIME,
    configuraciones TEXT COMMENT 'Preferencias del usuario',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_rol (rol_id)
);

-- =========================================
-- TABLA: pacientes
-- =========================================
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    sexo ENUM('M','F') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(100),
    direccion VARCHAR(255),
    ocupacion VARCHAR(100),
    foto_perfil VARCHAR(255),
    altura_inicial DECIMAL(5,2) COMMENT 'Altura en cm',
    peso_inicial DECIMAL(5,2) COMMENT 'Peso inicial en kg',
    objetivo TEXT COMMENT 'Objetivo del tratamiento',
    observaciones_generales TEXT,
    consultorio_id INT,
    usuario_creador_id INT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_nombre_apellido (nombre, apellido),
    INDEX idx_consultorio (consultorio_id),
    INDEX idx_activo (activo)
);

-- =========================================
-- TABLA: mediciones
-- =========================================
CREATE TABLE IF NOT EXISTS mediciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    fecha_medicion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('manual','inbody','mixta') NOT NULL,
    
    -- Datos básicos
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    imc DECIMAL(5,2),
    
    -- Composición corporal
    grasa_corporal DECIMAL(5,2) COMMENT 'Porcentaje de grasa corporal',
    grasa_corporal_kg DECIMAL(5,2) COMMENT 'Grasa corporal en kg',
    musculo DECIMAL(5,2) COMMENT 'Masa muscular en kg',
    musculo_porcentaje DECIMAL(5,2) COMMENT 'Porcentaje de masa muscular',
    agua_corporal DECIMAL(5,2) COMMENT 'Agua corporal en kg',
    agua_corporal_porcentaje DECIMAL(5,2) COMMENT 'Porcentaje de agua corporal',
    masa_osea DECIMAL(5,2) COMMENT 'Masa ósea en kg',
    
    -- Perímetros (en cm)
    perimetro_cintura DECIMAL(5,2),
    perimetro_cadera DECIMAL(5,2),
    perimetro_brazo_derecho DECIMAL(5,2),
    perimetro_brazo_izquierdo DECIMAL(5,2),
    perimetro_muslo_derecho DECIMAL(5,2),
    perimetro_muslo_izquierdo DECIMAL(5,2),
    perimetro_cuello DECIMAL(5,2),
    
    -- Pliegues cutáneos (en mm)
    pliegue_bicipital DECIMAL(5,2),
    pliegue_tricipital DECIMAL(5,2),
    pliegue_subescapular DECIMAL(5,2),
    pliegue_suprailiaco DECIMAL(5,2),
    pliegue_abdominal DECIMAL(5,2),
    pliegue_muslo DECIMAL(5,2),
    
    -- Datos adicionales InBody
    grasa_visceral DECIMAL(5,2) COMMENT 'Nivel de grasa visceral',
    metabolismo_basal INT COMMENT 'Tasa metabólica basal en kcal',
    edad_metabolica INT COMMENT 'Edad metabólica calculada',
    puntuacion_corporal INT COMMENT 'Puntuación corporal InBody',
    
    -- Análisis segmental (InBody)
    otros_valores TEXT COMMENT 'Campos adicionales variables (análisis segmental, etc.)',
    
    -- Metadatos
    observaciones TEXT,
    archivo_original VARCHAR(255) COMMENT 'Ruta al archivo InBody original',
    datos_ocr TEXT COMMENT 'Datos extraídos por OCR',
    usuario_id INT COMMENT 'Usuario que registró la medición',
    version INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_paciente_fecha (paciente_id, fecha_medicion),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo)
);

-- =========================================
-- TABLA: mediciones_versiones
-- =========================================
CREATE TABLE IF NOT EXISTS mediciones_versiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicion_id INT NOT NULL,
    version_anterior INT,
    datos_anteriores TEXT COMMENT 'Datos antes del cambio',
    datos_nuevos TEXT COMMENT 'Datos después del cambio',
    motivo_cambio TEXT,
    usuario_modificacion_id INT,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (medicion_id) REFERENCES mediciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_modificacion_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_medicion (medicion_id),
    INDEX idx_fecha (fecha_modificacion)
);

-- =========================================
-- TABLA: fotos_pacientes
-- =========================================
CREATE TABLE IF NOT EXISTS fotos_pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    ruta_imagen VARCHAR(255) NOT NULL,
    tipo_foto ENUM('perfil','frontal','lateral','posterior','detalle') DEFAULT 'frontal',
    descripcion TEXT,
    peso_momento DECIMAL(5,2) COMMENT 'Peso del paciente al momento de la foto',
    medicion_relacionada_id INT COMMENT 'ID de medición relacionada',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT COMMENT 'Usuario que subió la foto',
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medicion_relacionada_id) REFERENCES mediciones(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_paciente_fecha (paciente_id, fecha),
    INDEX idx_tipo (tipo_foto)
);

-- =========================================
-- TABLA: citas
-- =========================================
CREATE TABLE IF NOT EXISTS citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    nutricionista_id INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    duracion_minutos INT DEFAULT 60,
    tipo_consulta ENUM('primera_vez','seguimiento','control','urgencia') DEFAULT 'seguimiento',
    estado ENUM('programada','confirmada','en_curso','completada','cancelada','no_asistio') DEFAULT 'programada',
    motivo TEXT,
    notas_previas TEXT COMMENT 'Notas antes de la cita',
    notas_posteriores TEXT COMMENT 'Notas después de la cita',
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    fecha_recordatorio DATETIME,
    consultorio_id INT,
    usuario_creador_id INT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (nutricionista_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_fecha_hora (fecha_hora),
    INDEX idx_nutricionista_fecha (nutricionista_id, fecha_hora),
    INDEX idx_paciente (paciente_id),
    INDEX idx_estado (estado)
);

-- =========================================
-- TABLA: reportes
-- =========================================
CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('paciente_individual','consolidado','evolucion','comparativo') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    parametros TEXT COMMENT 'Parámetros usados para generar el reporte',
    ruta_archivo VARCHAR(255) COMMENT 'Ruta del PDF generado',
    paciente_id INT COMMENT 'Para reportes individuales',
    fecha_desde DATE,
    fecha_hasta DATE,
    usuario_generador_id INT NOT NULL,
    consultorio_id INT,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_generador_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_generacion (fecha_generacion),
    INDEX idx_usuario (usuario_generador_id)
);

-- =========================================
-- TABLA: notificaciones
-- =========================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('cita_recordatorio','medicion_pendiente','cumpleanos','sistema','alerta') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    destinatario_id INT NOT NULL,
    paciente_relacionado_id INT,
    cita_relacionada_id INT,
    leida BOOLEAN DEFAULT FALSE,
    enviado_email BOOLEAN DEFAULT FALSE,
    fecha_programada DATETIME,
    fecha_enviada DATETIME,
    fecha_leida DATETIME,
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_relacionado_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (cita_relacionada_id) REFERENCES citas(id) ON DELETE CASCADE,
    INDEX idx_destinatario_leida (destinatario_id, leida),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_programada (fecha_programada)
);

-- =========================================
-- TABLA: configuraciones
-- =========================================
CREATE TABLE IF NOT EXISTS configuraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo ENUM('string','number','boolean','json') DEFAULT 'string',
    descripcion TEXT,
    categoria VARCHAR(50) DEFAULT 'general',
    es_publica BOOLEAN DEFAULT FALSE COMMENT 'Si puede ser accedida por el frontend',
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categoria (categoria),
    INDEX idx_publica (es_publica)
);

-- =========================================
-- DATOS INICIALES
-- =========================================

-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion, permisos) VALUES 
('administrador', 'Acceso completo al sistema', '{"usuarios":["crear","leer","actualizar","eliminar"],"pacientes":["crear","leer","actualizar","eliminar"],"mediciones":["crear","leer","actualizar","eliminar"],"reportes":["crear","leer","exportar"],"citas":["crear","leer","actualizar","eliminar"],"configuraciones":["leer","actualizar"]}'),
('nutricionista', 'Profesional nutricionista', '{"pacientes":["crear","leer","actualizar"],"mediciones":["crear","leer","actualizar"],"reportes":["crear","leer","exportar"],"citas":["crear","leer","actualizar"]}'),
('secretario', 'Personal administrativo', '{"pacientes":["crear","leer"],"citas":["crear","leer","actualizar"],"reportes":["leer"]}'),
('paciente', 'Paciente del consultorio', '{"perfil_propio":["leer"],"mediciones_propias":["leer"],"citas_propias":["leer"]}');

-- Insertar consultorio por defecto
INSERT INTO consultorios (nombre, direccion, telefono, email) VALUES 
('Consultorio Principal', 'Dirección del consultorio', '(000) 000-0000', 'info@alimetria.com');

-- Insertar configuraciones por defecto
INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_publica) VALUES 
('sistema_version', '1.0.0', 'string', 'Versión del sistema', 'sistema', true),
('consultorio_nombre', 'Alimetria', 'string', 'Nombre del consultorio', 'general', true),
('recordatorio_dias_previos', '1', 'number', 'Días previos para enviar recordatorios', 'notificaciones', false),
('max_file_size_mb', '10', 'number', 'Tamaño máximo de archivo en MB', 'archivos', false),
('formatos_imagen_permitidos', '["jpg", "jpeg", "png", "pdf"]', 'json', 'Formatos de imagen permitidos', 'archivos', false),
('tema_color_primario', '#1976d2', 'string', 'Color primario del tema', 'interfaz', true),
('mostrar_demo', 'true', 'boolean', 'Mostrar datos de demostración', 'general', true);

-- =========================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =========================================
CREATE INDEX idx_mediciones_paciente_fecha_tipo ON mediciones(paciente_id, fecha_medicion DESC, tipo);
CREATE INDEX idx_citas_nutricionista_estado_fecha ON citas(nutricionista_id, estado, fecha_hora);
CREATE INDEX idx_notificaciones_usuario_tipo_leida ON notificaciones(destinatario_id, tipo, leida);

-- =========================================
-- VISTA ÚTIL
-- =========================================
CREATE VIEW v_pacientes_completo AS
SELECT 
    p.*,
    u.nombre as creador_nombre,
    c.nombre as consultorio_nombre,
    m.fecha_medicion as ultima_medicion_fecha,
    m.peso as ultimo_peso,
    m.imc as ultimo_imc,
    m.grasa_corporal as ultima_grasa,
    COUNT(med.id) as total_mediciones
FROM pacientes p
LEFT JOIN usuarios u ON p.usuario_creador_id = u.id
LEFT JOIN consultorios c ON p.consultorio_id = c.id
LEFT JOIN mediciones m ON p.id = m.paciente_id AND m.fecha_medicion = (
    SELECT MAX(fecha_medicion) 
    FROM mediciones m2 
    WHERE m2.paciente_id = p.id AND m2.activo = TRUE
)
LEFT JOIN mediciones med ON p.id = med.paciente_id AND med.activo = TRUE
WHERE p.activo = TRUE
GROUP BY p.id;

-- =========================================
-- COMENTARIOS FINALES
-- =========================================
-- Base de datos Alimetria creada exitosamente para MariaDB/XAMPP
-- Versión: 1.0.0 MariaDB Compatible
-- Fecha: Septiembre 2025
-- Autor: Gus - Proyecto Alimetria
