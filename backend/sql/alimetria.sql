-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-09-2025 a las 17:58:06
-- Versión del servidor: 10.4.25-MariaDB
-- Versión de PHP: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `alimetria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `nutricionista_id` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `duracion_minutos` int(11) DEFAULT 60,
  `tipo_consulta` enum('primera_vez','seguimiento','control','urgencia') COLLATE utf8mb4_unicode_ci DEFAULT 'seguimiento',
  `estado` enum('programada','confirmada','en_curso','completada','cancelada','no_asistio') COLLATE utf8mb4_unicode_ci DEFAULT 'programada',
  `motivo` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas_previas` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Notas antes de la cita',
  `notas_posteriores` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Notas después de la cita',
  `recordatorio_enviado` tinyint(1) DEFAULT 0,
  `fecha_recordatorio` datetime DEFAULT NULL,
  `consultorio_id` int(11) DEFAULT NULL,
  `usuario_creador_id` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones`
--

CREATE TABLE `configuraciones` (
  `id` int(11) NOT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `es_publica` tinyint(1) DEFAULT 0 COMMENT 'Si puede ser accedida por el frontend',
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuraciones`
--

INSERT INTO `configuraciones` (`id`, `clave`, `valor`, `tipo`, `descripcion`, `categoria`, `es_publica`, `fecha_actualizacion`) VALUES
(1, 'sistema_version', '1.0.0', 'string', 'Versión del sistema', 'sistema', 1, '2025-09-10 12:35:00'),
(2, 'consultorio_nombre', 'Alimetria', 'string', 'Nombre del consultorio', 'general', 1, '2025-09-10 12:35:00'),
(3, 'recordatorio_dias_previos', '1', 'number', 'Días previos para enviar recordatorios', 'notificaciones', 0, '2025-09-10 12:35:00'),
(4, 'max_file_size_mb', '10', 'number', 'Tamaño máximo de archivo en MB', 'archivos', 0, '2025-09-10 12:35:00'),
(5, 'formatos_imagen_permitidos', '[\"jpg\", \"jpeg\", \"png\", \"pdf\"]', 'json', 'Formatos de imagen permitidos', 'archivos', 0, '2025-09-10 12:35:00'),
(6, 'tema_color_primario', '#1976d2', 'string', 'Color primario del tema', 'interfaz', 1, '2025-09-10 12:35:00'),
(7, 'mostrar_demo', 'true', 'boolean', 'Mostrar datos de demostración', 'general', 1, '2025-09-10 12:35:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultorios`
--

CREATE TABLE `consultorios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `configuracion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Configuraciones específicas del consultorio',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `consultorios`
--

INSERT INTO `consultorios` (`id`, `nombre`, `direccion`, `telefono`, `email`, `activo`, `configuracion`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Consultorio Principal', 'Dirección del consultorio', '(000) 000-0000', 'info@alimetria.com', 1, NULL, '2025-09-10 12:35:00', '2025-09-10 12:35:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotos_pacientes`
--

CREATE TABLE `fotos_pacientes` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `ruta_imagen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_foto` enum('perfil','frontal','lateral','posterior','detalle') COLLATE utf8mb4_unicode_ci DEFAULT 'frontal',
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso_momento` decimal(5,2) DEFAULT NULL COMMENT 'Peso del paciente al momento de la foto',
  `medicion_relacionada_id` int(11) DEFAULT NULL COMMENT 'ID de medición relacionada',
  `fecha` datetime DEFAULT current_timestamp(),
  `usuario_id` int(11) DEFAULT NULL COMMENT 'Usuario que subió la foto',
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mediciones`
--

CREATE TABLE `mediciones` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `fecha_medicion` datetime DEFAULT current_timestamp(),
  `tipo` enum('manual','inbody','mixta') COLLATE utf8mb4_unicode_ci NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `altura` decimal(5,2) DEFAULT NULL,
  `imc` decimal(5,2) DEFAULT NULL,
  `grasa_corporal` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje de grasa corporal',
  `grasa_corporal_kg` decimal(5,2) DEFAULT NULL COMMENT 'Grasa corporal en kg',
  `musculo` decimal(5,2) DEFAULT NULL COMMENT 'Masa muscular en kg',
  `musculo_porcentaje` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje de masa muscular',
  `agua_corporal` decimal(5,2) DEFAULT NULL COMMENT 'Agua corporal en kg',
  `agua_corporal_porcentaje` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje de agua corporal',
  `masa_osea` decimal(5,2) DEFAULT NULL COMMENT 'Masa ósea en kg',
  `perimetro_cintura` decimal(5,2) DEFAULT NULL,
  `perimetro_cadera` decimal(5,2) DEFAULT NULL,
  `perimetro_brazo_derecho` decimal(5,2) DEFAULT NULL,
  `perimetro_brazo_izquierdo` decimal(5,2) DEFAULT NULL,
  `perimetro_muslo_derecho` decimal(5,2) DEFAULT NULL,
  `perimetro_muslo_izquierdo` decimal(5,2) DEFAULT NULL,
  `perimetro_cuello` decimal(5,2) DEFAULT NULL,
  `pliegue_bicipital` decimal(5,2) DEFAULT NULL,
  `pliegue_tricipital` decimal(5,2) DEFAULT NULL,
  `pliegue_subescapular` decimal(5,2) DEFAULT NULL,
  `pliegue_suprailiaco` decimal(5,2) DEFAULT NULL,
  `pliegue_abdominal` decimal(5,2) DEFAULT NULL,
  `pliegue_muslo` decimal(5,2) DEFAULT NULL,
  `grasa_visceral` decimal(5,2) DEFAULT NULL COMMENT 'Nivel de grasa visceral',
  `metabolismo_basal` int(11) DEFAULT NULL COMMENT 'Tasa metabólica basal en kcal',
  `edad_metabolica` int(11) DEFAULT NULL COMMENT 'Edad metabólica calculada',
  `puntuacion_corporal` int(11) DEFAULT NULL COMMENT 'Puntuación corporal InBody',
  `otros_valores` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Campos adicionales variables (análisis segmental, etc.)',
  `observaciones` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archivo_original` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al archivo InBody original',
  `datos_ocr` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Datos extraídos por OCR',
  `usuario_id` int(11) DEFAULT NULL COMMENT 'Usuario que registró la medición',
  `version` int(11) DEFAULT 1,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mediciones`
--

INSERT INTO `mediciones` (`id`, `paciente_id`, `fecha_medicion`, `tipo`, `peso`, `altura`, `imc`, `grasa_corporal`, `grasa_corporal_kg`, `musculo`, `musculo_porcentaje`, `agua_corporal`, `agua_corporal_porcentaje`, `masa_osea`, `perimetro_cintura`, `perimetro_cadera`, `perimetro_brazo_derecho`, `perimetro_brazo_izquierdo`, `perimetro_muslo_derecho`, `perimetro_muslo_izquierdo`, `perimetro_cuello`, `pliegue_bicipital`, `pliegue_tricipital`, `pliegue_subescapular`, `pliegue_suprailiaco`, `pliegue_abdominal`, `pliegue_muslo`, `grasa_visceral`, `metabolismo_basal`, `edad_metabolica`, `puntuacion_corporal`, `otros_valores`, `observaciones`, `archivo_original`, `datos_ocr`, `usuario_id`, `version`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 1, '2025-08-11 12:44:56', 'manual', '82.30', '175.50', '26.70', '18.50', NULL, '35.20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Evaluación inicial', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(2, 1, '2025-09-03 12:44:56', 'manual', '80.10', '175.50', '26.00', '17.80', NULL, '35.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Control mensual', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(3, 2, '2025-08-16 12:44:56', 'manual', '68.50', '162.00', '26.10', '22.30', NULL, '28.50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Evaluación inicial', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(4, 2, '2025-09-07 12:44:56', 'manual', '67.20', '162.00', '25.60', '21.80', NULL, '29.10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Progreso favorable', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(5, 3, '2025-08-21 12:44:56', 'manual', '95.70', '180.20', '29.50', '25.80', NULL, '40.20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IMC elevado - seguimiento nutricional', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(6, 4, '2025-08-26 12:44:56', 'manual', '55.20', '158.50', '22.00', '16.20', NULL, '26.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Peso bajo - plan de aumento', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(7, 5, '2025-08-31 12:44:56', 'manual', '78.40', '172.80', '26.30', '19.50', NULL, '34.10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Evaluación de rutina', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mediciones_versiones`
--

CREATE TABLE `mediciones_versiones` (
  `id` int(11) NOT NULL,
  `medicion_id` int(11) NOT NULL,
  `version_anterior` int(11) DEFAULT NULL,
  `datos_anteriores` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Datos antes del cambio',
  `datos_nuevos` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Datos después del cambio',
  `motivo_cambio` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_modificacion_id` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `tipo` enum('cita_recordatorio','medicion_pendiente','cumpleanos','sistema','alerta') COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `paciente_relacionado_id` int(11) DEFAULT NULL,
  `cita_relacionada_id` int(11) DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `enviado_email` tinyint(1) DEFAULT 0,
  `fecha_programada` datetime DEFAULT NULL,
  `fecha_enviada` datetime DEFAULT NULL,
  `fecha_leida` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sexo` enum('M','F') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocupacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_perfil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `altura_inicial` decimal(5,2) DEFAULT NULL COMMENT 'Altura en cm',
  `peso_inicial` decimal(5,2) DEFAULT NULL COMMENT 'Peso inicial en kg',
  `objetivo` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Objetivo del tratamiento',
  `observaciones_generales` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultorio_id` int(11) DEFAULT NULL,
  `usuario_creador_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `sexo`, `fecha_nacimiento`, `telefono`, `email`, `direccion`, `ocupacion`, `foto_perfil`, `altura_inicial`, `peso_inicial`, `objetivo`, `observaciones_generales`, `consultorio_id`, `usuario_creador_id`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Juan', 'Pérez', 'M', '1985-03-15', '(381) 123-4567', 'juan.perez@email.com', 'Av. Independencia 123, San Miguel de Tucumán', 'Ingeniero', NULL, '175.50', '82.30', 'Reducir peso y mejorar condición física', NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(2, 'María', 'González', 'F', '1990-07-22', '(381) 234-5678', 'maria.gonzalez@email.com', 'Calle Muñecas 456, Tucumán', 'Profesora', NULL, '162.00', '68.50', 'Mantener peso saludable y tonificar', NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(3, 'Carlos', 'Rodríguez', 'M', '1978-11-08', '(381) 345-6789', 'carlos.rodriguez@email.com', 'Barrio Norte, Tucumán', 'Contador', NULL, '180.20', '95.70', 'Perder peso por recomendación médica', NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(4, 'Anita', 'Martínez', 'F', '1995-02-14', '(381) 456-7890', 'ana.martinez@email.com', 'Villa Mariano Moreno, Tucumán', 'Estudiante', NULL, '158.50', '55.20', 'Ganar masa muscular', NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:49:13'),
(5, 'Roberto', 'Silva', 'M', '1988-09-30', '(381) 567-8901', 'roberto.silva@email.com', 'Centro, San Miguel de Tucumán', 'Comerciante', NULL, '172.80', '78.40', 'Mejorar composición corporal', NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `tipo` enum('paciente_individual','consolidado','evolucion','comparativo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parametros` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Parámetros usados para generar el reporte',
  `ruta_archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta del PDF generado',
  `paciente_id` int(11) DEFAULT NULL COMMENT 'Para reportes individuales',
  `fecha_desde` date DEFAULT NULL,
  `fecha_hasta` date DEFAULT NULL,
  `usuario_generador_id` int(11) NOT NULL,
  `consultorio_id` int(11) DEFAULT NULL,
  `fecha_generacion` datetime DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permisos` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Permisos específicos del rol en formato JSON',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `permisos`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'administrador', 'Acceso completo al sistema', '{\"usuarios\":[\"crear\",\"leer\",\"actualizar\",\"eliminar\"],\"pacientes\":[\"crear\",\"leer\",\"actualizar\",\"eliminar\"],\"mediciones\":[\"crear\",\"leer\",\"actualizar\",\"eliminar\"],\"reportes\":[\"crear\",\"leer\",\"exportar\"],\"citas\":[\"crear\",\"leer\",\"actualizar\",\"eliminar\"],\"configuraciones\":[\"leer\",\"actualizar\"]}', 1, '2025-09-10 12:35:00', '2025-09-10 12:35:00'),
(2, 'nutricionista', 'Profesional nutricionista', '{\"pacientes\":[\"crear\",\"leer\",\"actualizar\"],\"mediciones\":[\"crear\",\"leer\",\"actualizar\"],\"reportes\":[\"crear\",\"leer\",\"exportar\"],\"citas\":[\"crear\",\"leer\",\"actualizar\"]}', 1, '2025-09-10 12:35:00', '2025-09-10 12:35:00'),
(3, 'secretario', 'Personal administrativo', '{\"pacientes\":[\"crear\",\"leer\"],\"citas\":[\"crear\",\"leer\",\"actualizar\"],\"reportes\":[\"leer\"]}', 1, '2025-09-10 12:35:00', '2025-09-10 12:35:00'),
(4, 'paciente', 'Paciente del consultorio', '{\"perfil_propio\":[\"leer\"],\"mediciones_propias\":[\"leer\"],\"citas_propias\":[\"leer\"]}', 1, '2025-09-10 12:35:00', '2025-09-10 12:35:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_perfil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol_id` int(11) NOT NULL,
  `consultorio_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `configuraciones` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Preferencias del usuario',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `foto_perfil`, `rol_id`, `consultorio_id`, `activo`, `ultimo_acceso`, `configuraciones`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Administrador', 'Sistema', 'admin@alimetria.com', '$2a$12$Re3dJ1PRX96W1V/iUDH/b.c2QcErL.1Vpj0fo8GZtMoQJ/i9shumO', '(000) 000-0000', NULL, 1, 1, 1, '2025-09-10 12:42:24', NULL, '2025-09-10 12:41:21', '2025-09-10 12:42:24');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_pacientes_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_pacientes_completo` (
`id` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`sexo` enum('M','F')
,`fecha_nacimiento` date
,`telefono` varchar(50)
,`email` varchar(100)
,`direccion` varchar(255)
,`ocupacion` varchar(100)
,`foto_perfil` varchar(255)
,`altura_inicial` decimal(5,2)
,`peso_inicial` decimal(5,2)
,`objetivo` text
,`observaciones_generales` text
,`consultorio_id` int(11)
,`usuario_creador_id` int(11)
,`activo` tinyint(1)
,`fecha_creacion` datetime
,`fecha_actualizacion` datetime
,`creador_nombre` varchar(100)
,`consultorio_nombre` varchar(100)
,`ultima_medicion_fecha` datetime
,`ultimo_peso` decimal(5,2)
,`ultimo_imc` decimal(5,2)
,`ultima_grasa` decimal(5,2)
,`total_mediciones` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_pacientes_completo`
--
DROP TABLE IF EXISTS `v_pacientes_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_pacientes_completo`  AS SELECT `p`.`id` AS `id`, `p`.`nombre` AS `nombre`, `p`.`apellido` AS `apellido`, `p`.`sexo` AS `sexo`, `p`.`fecha_nacimiento` AS `fecha_nacimiento`, `p`.`telefono` AS `telefono`, `p`.`email` AS `email`, `p`.`direccion` AS `direccion`, `p`.`ocupacion` AS `ocupacion`, `p`.`foto_perfil` AS `foto_perfil`, `p`.`altura_inicial` AS `altura_inicial`, `p`.`peso_inicial` AS `peso_inicial`, `p`.`objetivo` AS `objetivo`, `p`.`observaciones_generales` AS `observaciones_generales`, `p`.`consultorio_id` AS `consultorio_id`, `p`.`usuario_creador_id` AS `usuario_creador_id`, `p`.`activo` AS `activo`, `p`.`fecha_creacion` AS `fecha_creacion`, `p`.`fecha_actualizacion` AS `fecha_actualizacion`, `u`.`nombre` AS `creador_nombre`, `c`.`nombre` AS `consultorio_nombre`, `m`.`fecha_medicion` AS `ultima_medicion_fecha`, `m`.`peso` AS `ultimo_peso`, `m`.`imc` AS `ultimo_imc`, `m`.`grasa_corporal` AS `ultima_grasa`, count(`med`.`id`) AS `total_mediciones` FROM ((((`pacientes` `p` left join `usuarios` `u` on(`p`.`usuario_creador_id` = `u`.`id`)) left join `consultorios` `c` on(`p`.`consultorio_id` = `c`.`id`)) left join `mediciones` `m` on(`p`.`id` = `m`.`paciente_id` and `m`.`fecha_medicion` = (select max(`m2`.`fecha_medicion`) from `mediciones` `m2` where `m2`.`paciente_id` = `p`.`id` and `m2`.`activo` = 1))) left join `mediciones` `med` on(`p`.`id` = `med`.`paciente_id` and `med`.`activo` = 1)) WHERE `p`.`activo` = 1 GROUP BY `p`.`id``id`  ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consultorio_id` (`consultorio_id`),
  ADD KEY `usuario_creador_id` (`usuario_creador_id`),
  ADD KEY `idx_fecha_hora` (`fecha_hora`),
  ADD KEY `idx_nutricionista_fecha` (`nutricionista_id`,`fecha_hora`),
  ADD KEY `idx_paciente` (`paciente_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_citas_nutricionista_estado_fecha` (`nutricionista_id`,`estado`,`fecha_hora`);

--
-- Indices de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_publica` (`es_publica`);

--
-- Indices de la tabla `consultorios`
--
ALTER TABLE `consultorios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `fotos_pacientes`
--
ALTER TABLE `fotos_pacientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medicion_relacionada_id` (`medicion_relacionada_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_paciente_fecha` (`paciente_id`,`fecha`),
  ADD KEY `idx_tipo` (`tipo_foto`);

--
-- Indices de la tabla `mediciones`
--
ALTER TABLE `mediciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_paciente_fecha` (`paciente_id`,`fecha_medicion`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_mediciones_paciente_fecha_tipo` (`paciente_id`,`fecha_medicion`,`tipo`);

--
-- Indices de la tabla `mediciones_versiones`
--
ALTER TABLE `mediciones_versiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_modificacion_id` (`usuario_modificacion_id`),
  ADD KEY `idx_medicion` (`medicion_id`),
  ADD KEY `idx_fecha` (`fecha_modificacion`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_relacionado_id` (`paciente_relacionado_id`),
  ADD KEY `cita_relacionada_id` (`cita_relacionada_id`),
  ADD KEY `idx_destinatario_leida` (`destinatario_id`,`leida`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_fecha_programada` (`fecha_programada`),
  ADD KEY `idx_notificaciones_usuario_tipo_leida` (`destinatario_id`,`tipo`,`leida`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_creador_id` (`usuario_creador_id`),
  ADD KEY `idx_nombre_apellido` (`nombre`,`apellido`),
  ADD KEY `idx_consultorio` (`consultorio_id`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_id` (`paciente_id`),
  ADD KEY `consultorio_id` (`consultorio_id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_fecha_generacion` (`fecha_generacion`),
  ADD KEY `idx_usuario` (`usuario_generador_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `consultorio_id` (`consultorio_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_rol` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `consultorios`
--
ALTER TABLE `consultorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `fotos_pacientes`
--
ALTER TABLE `fotos_pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mediciones`
--
ALTER TABLE `mediciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `mediciones_versiones`
--
ALTER TABLE `mediciones_versiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`nutricionista_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `fotos_pacientes`
--
ALTER TABLE `fotos_pacientes`
  ADD CONSTRAINT `fotos_pacientes_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fotos_pacientes_ibfk_2` FOREIGN KEY (`medicion_relacionada_id`) REFERENCES `mediciones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fotos_pacientes_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `mediciones`
--
ALTER TABLE `mediciones`
  ADD CONSTRAINT `mediciones_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mediciones_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `mediciones_versiones`
--
ALTER TABLE `mediciones_versiones`
  ADD CONSTRAINT `mediciones_versiones_ibfk_1` FOREIGN KEY (`medicion_id`) REFERENCES `mediciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mediciones_versiones_ibfk_2` FOREIGN KEY (`usuario_modificacion_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`paciente_relacionado_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notificaciones_ibfk_3` FOREIGN KEY (`cita_relacionada_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`usuario_generador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reportes_ibfk_3` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
