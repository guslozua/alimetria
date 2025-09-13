-- =====================================================
-- ALIMETRIA - MIGRACIÓN: OBRAS SOCIALES
-- =====================================================

-- 1. Crear tabla de obras sociales
CREATE TABLE `obras_sociales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código identificatorio de la obra social',
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_activo` (`activo`),
  KEY `idx_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insertar obras sociales comunes en Argentina
INSERT INTO `obras_sociales` (`nombre`, `codigo`, `descripcion`) VALUES
('PARTICULAR', 'PART', 'Paciente particular sin cobertura de obra social'),
('OSDE', 'OSDE', 'Organización de Servicios Directos Empresarios'),
('SWISS MEDICAL', 'SWISS', 'Swiss Medical Group'),
('MEDICUS', 'MEDICUS', 'Medicus S.A.'),
('IOMA', 'IOMA', 'Instituto de Obra Médico Asistencial'),
('PAMI', 'PAMI', 'Programa de Atención Médica Integral'),
('OSECAC', 'OSECAC', 'Obra Social de Empleados de Comercio y Actividades Civiles'),
('OSPLAD', 'OSPLAD', 'Obra Social del Personal de la Alimentación'),
('OSPRERA', 'OSPRERA', 'Obra Social del Personal Rural y Estibadores de la República Argentina'),
('OSDEPYM', 'OSDEPYM', 'Obra Social de Directivos de Empresas Privadas y Mixtas'),
('OSPAT', 'OSPAT', 'Obra Social del Personal de la Actividad del Turf'),
('OSUTHGRA', 'OSUTHGRA', 'Obra Social de la Unión Trabajadores del Turismo, Hoteleros y Gastronómicos'),
('OSCHOCA', 'OSCHOCA', 'Obra Social de Choferes de Camiones y Afines'),
('OSPATCA', 'OSPATCA', 'Obra Social del Personal Auxiliar de Casas Particulares'),
('GALENO', 'GALENO', 'Galeno Argentina S.A.'),
('HOSPITAL BRITANICO', 'BRITANIC', 'Hospital Británico de Buenos Aires'),
('HOSPITAL ITALIANO', 'ITALIANO', 'Hospital Italiano de Buenos Aires'),
('SANCOR SALUD', 'SANCOR', 'Sancor Cooperativa de Seguros Ltda.'),
('ACCORD SALUD', 'ACCORD', 'Accord Salud S.A.'),
('PREVENCION SALUD', 'PREVENCION', 'Prevención Salud');

-- 3. Agregar columnas a la tabla pacientes
ALTER TABLE `pacientes` 
ADD COLUMN `obra_social_id` int(11) DEFAULT NULL AFTER `observaciones_generales`,
ADD COLUMN `numero_afiliado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `obra_social_id`;

-- 4. Agregar foreign key
ALTER TABLE `pacientes` 
ADD CONSTRAINT `fk_pacientes_obra_social` 
FOREIGN KEY (`obra_social_id`) REFERENCES `obras_sociales` (`id`) ON DELETE SET NULL;

-- 5. Crear índices para optimizar consultas
ALTER TABLE `pacientes` 
ADD INDEX `idx_obra_social` (`obra_social_id`),
ADD INDEX `idx_numero_afiliado` (`numero_afiliado`);

-- 6. Actualizar pacientes existentes para que tengan "PARTICULAR" por defecto
UPDATE `pacientes` 
SET `obra_social_id` = (SELECT id FROM obras_sociales WHERE codigo = 'PART' LIMIT 1) 
WHERE `obra_social_id` IS NULL;

-- 7. Actualizar la vista v_pacientes_completo para incluir obra social
DROP VIEW IF EXISTS `v_pacientes_completo`;

CREATE VIEW `v_pacientes_completo` AS 
SELECT 
  `p`.`id` AS `id`,
  `p`.`nombre` AS `nombre`,
  `p`.`apellido` AS `apellido`,
  `p`.`sexo` AS `sexo`,
  `p`.`fecha_nacimiento` AS `fecha_nacimiento`,
  `p`.`telefono` AS `telefono`,
  `p`.`email` AS `email`,
  `p`.`direccion` AS `direccion`,
  `p`.`ocupacion` AS `ocupacion`,
  `p`.`foto_perfil` AS `foto_perfil`,
  `p`.`altura_inicial` AS `altura_inicial`,
  `p`.`peso_inicial` AS `peso_inicial`,
  `p`.`objetivo` AS `objetivo`,
  `p`.`observaciones_generales` AS `observaciones_generales`,
  `p`.`obra_social_id` AS `obra_social_id`,
  `p`.`numero_afiliado` AS `numero_afiliado`,
  `p`.`consultorio_id` AS `consultorio_id`,
  `p`.`usuario_creador_id` AS `usuario_creador_id`,
  `p`.`activo` AS `activo`,
  `p`.`fecha_creacion` AS `fecha_creacion`,
  `p`.`fecha_actualizacion` AS `fecha_actualizacion`,
  `u`.`nombre` AS `creador_nombre`,
  `c`.`nombre` AS `consultorio_nombre`,
  `os`.`nombre` AS `obra_social_nombre`,
  `os`.`codigo` AS `obra_social_codigo`,
  `m`.`fecha_medicion` AS `ultima_medicion_fecha`,
  `m`.`peso` AS `ultimo_peso`,
  `m`.`imc` AS `ultimo_imc`,
  `m`.`grasa_corporal` AS `ultima_grasa`,
  count(`med`.`id`) AS `total_mediciones` 
FROM (((((
  `pacientes` `p` 
  LEFT JOIN `usuarios` `u` ON(`p`.`usuario_creador_id` = `u`.`id`)) 
  LEFT JOIN `consultorios` `c` ON(`p`.`consultorio_id` = `c`.`id`)) 
  LEFT JOIN `obras_sociales` `os` ON(`p`.`obra_social_id` = `os`.`id`))
  LEFT JOIN `mediciones` `m` ON(`p`.`id` = `m`.`paciente_id` AND `m`.`fecha_medicion` = (
    SELECT max(`m2`.`fecha_medicion`) 
    FROM `mediciones` `m2` 
    WHERE `m2`.`paciente_id` = `p`.`id` AND `m2`.`activo` = 1
  ))) 
  LEFT JOIN `mediciones` `med` ON(`p`.`id` = `med`.`paciente_id` AND `med`.`activo` = 1)) 
WHERE `p`.`activo` = 1 
GROUP BY `p`.`id`;

-- =====================================================
-- MIGRACIÓN COMPLETADA EXITOSAMENTE
-- =====================================================
