-- ==================================================
-- SISTEMA DE SUPLEMENTOS - ALIMETRIA
-- Script 1: Creación de Tablas
-- ==================================================

-- Tabla de categorías de suplementos
CREATE TABLE categorias_suplementos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#667eea',
    icono VARCHAR(50) DEFAULT 'supplement',
    orden_visualizacion INT DEFAULT 0,
    activo TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla principal de suplementos
CREATE TABLE suplementos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(150),
    categoria_id INT NOT NULL,
    
    -- Información básica
    descripcion_corta VARCHAR(255),
    descripcion_detallada TEXT,
    para_que_sirve TEXT,
    beneficios_principales JSON, -- Array de beneficios
    
    -- Dosificación
    dosis_recomendada VARCHAR(255),
    dosis_minima VARCHAR(100),
    dosis_maxima VARCHAR(100),
    forma_presentacion ENUM('cápsula','tableta','polvo','líquido','goma','inyectable','tópico') DEFAULT 'cápsula',
    
    -- Administración
    frecuencia_recomendada VARCHAR(100), -- "1-2 veces al día"
    mejor_momento_toma VARCHAR(100), -- "Con comidas", "En ayunas", etc.
    duracion_tratamiento_tipica VARCHAR(100), -- "3-6 meses", "Continuo", etc.
    
    -- Información adicional
    popularidad_uso INT DEFAULT 0, -- Cuántas veces se ha usado/recomendado
    nivel_evidencia ENUM('alta','media','baja','experimental') DEFAULT 'media',
    precio_referencial DECIMAL(8,2) DEFAULT NULL,
    
    -- Control
    activo TINYINT DEFAULT 1,
    destacado TINYINT DEFAULT 0, -- Para mostrar en inicio
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias_suplementos(id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_activo (activo),
    INDEX idx_destacado (destacado),
    FULLTEXT(nombre, descripcion_corta, para_que_sirve)
);

-- Tabla de indicaciones específicas
CREATE TABLE suplemento_indicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suplemento_id INT NOT NULL,
    indicacion VARCHAR(255) NOT NULL, -- "Hipercolesterolemia", "Osteoporosis"
    perfil_paciente TEXT, -- "Adultos mayores", "Deportistas", "Embarazadas"
    nivel_recomendacion ENUM('alta','media','baja') DEFAULT 'media',
    notas_adicionales TEXT,
    activo TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suplemento_id) REFERENCES suplementos(id) ON DELETE CASCADE,
    INDEX idx_suplemento (suplemento_id)
);

-- Tabla de contraindicaciones y precauciones
CREATE TABLE suplemento_contraindicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suplemento_id INT NOT NULL,
    tipo ENUM('contraindicacion','precaucion','advertencia') NOT NULL,
    descripcion TEXT NOT NULL,
    poblacion_afectada VARCHAR(255), -- "Embarazadas", "Personas con diabetes"
    severidad ENUM('alta','media','baja') DEFAULT 'media',
    activo TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suplemento_id) REFERENCES suplementos(id) ON DELETE CASCADE,
    INDEX idx_suplemento (suplemento_id),
    INDEX idx_tipo (tipo)
);

-- Tabla de interacciones medicamentosas
CREATE TABLE suplemento_interacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suplemento_id INT NOT NULL,
    tipo_interaccion ENUM('medicamento','suplemento','alimento') NOT NULL,
    nombre_interaccion VARCHAR(150) NOT NULL, -- "Warfarina", "Vitamina E", "Lácteos"
    descripcion_interaccion TEXT,
    severidad ENUM('grave','moderada','leve') DEFAULT 'moderada',
    recomendacion TEXT, -- "Evitar", "Separar 2 horas", etc.
    activo TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suplemento_id) REFERENCES suplementos(id) ON DELETE CASCADE,
    INDEX idx_suplemento (suplemento_id),
    INDEX idx_severidad (severidad)
);

-- Tabla de efectos secundarios
CREATE TABLE suplemento_efectos_secundarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suplemento_id INT NOT NULL,
    efecto_secundario VARCHAR(255) NOT NULL,
    frecuencia ENUM('muy_común','común','poco_común','raro','muy_raro') DEFAULT 'poco_común',
    descripcion TEXT,
    manejo_recomendado TEXT,
    activo TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suplemento_id) REFERENCES suplementos(id) ON DELETE CASCADE,
    INDEX idx_suplemento (suplemento_id)
);

-- Tabla de estudios/referencias científicas
CREATE TABLE suplemento_referencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suplemento_id INT NOT NULL,
    titulo_estudio VARCHAR(255),
    autores VARCHAR(255),
    revista_publicacion VARCHAR(150),
    año_publicacion YEAR,
    tipo_estudio ENUM('ensayo_clinico','revision_sistematica','meta_analisis','observacional','caso_control') DEFAULT 'observacional',
    url_referencia VARCHAR(500),
    resumen_hallazgos TEXT,
    calidad_evidencia ENUM('alta','moderada','baja','muy_baja') DEFAULT 'moderada',
    activo TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suplemento_id) REFERENCES suplementos(id) ON DELETE CASCADE,
    INDEX idx_suplemento (suplemento_id),
    INDEX idx_año (año_publicacion)
);

-- Índices adicionales para optimización
CREATE INDEX idx_suplementos_busqueda ON suplementos(nombre, activo);
CREATE INDEX idx_categorias_orden ON categorias_suplementos(orden_visualizacion, activo);

-- Comentarios para documentación
ALTER TABLE categorias_suplementos COMMENT = 'Categorías de clasificación de suplementos nutricionales';
ALTER TABLE suplementos COMMENT = 'Tabla principal con información básica de suplementos';
ALTER TABLE suplemento_indicaciones COMMENT = 'Indicaciones terapéuticas específicas de cada suplemento';
ALTER TABLE suplemento_contraindicaciones COMMENT = 'Contraindicaciones, precauciones y advertencias';
ALTER TABLE suplemento_interacciones COMMENT = 'Interacciones con medicamentos, otros suplementos y alimentos';
ALTER TABLE suplemento_efectos_secundarios COMMENT = 'Efectos adversos documentados';
ALTER TABLE suplemento_referencias COMMENT = 'Referencias científicas y evidencia clínica';
