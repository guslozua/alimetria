-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-09-2025 a las 14:43:26
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
-- Estructura de tabla para la tabla `categorias_suplementos`
--

CREATE TABLE `categorias_suplementos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#667eea',
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'supplement',
  `orden_visualizacion` int(11) DEFAULT 0,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorías de clasificación de suplementos nutricionales';

--
-- Volcado de datos para la tabla `categorias_suplementos`
--

INSERT INTO `categorias_suplementos` (`id`, `nombre`, `descripcion`, `color`, `icono`, `orden_visualizacion`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Vitaminas', 'Vitaminas esenciales y complejos vitamínicos', '#FF6B6B', '🌈', 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(2, 'Minerales', 'Minerales y oligoelementos esenciales', '#4ECDC4', '⚡', 2, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(3, 'Proteínas', 'Suplementos proteicos y aminoácidos', '#45B7D1', '🥩', 3, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(4, 'Ácidos Grasos', 'Omega 3, 6, 9 y otros ácidos grasos esenciales', '#96CEB4', '🐟', 4, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(5, 'Probióticos', 'Microorganismos beneficiosos para la salud intestinal', '#FFEAA7', '💚', 5, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(6, 'Articular', 'Suplementos para la salud articular y ósea', '#DDA0DD', '🦴', 6, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(7, 'Deportivos', 'Suplementos específicos para deportistas', '#FFB347', '💪', 7, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41'),
(8, 'Antioxidantes', 'Compuestos antioxidantes y anti-envejecimiento', '#98D8C8', '🛡️', 8, 1, '2025-09-22 00:03:41', '2025-09-22 00:03:41');

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

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `paciente_id`, `nutricionista_id`, `fecha_hora`, `duracion_minutos`, `tipo_consulta`, `estado`, `motivo`, `notas_previas`, `notas_posteriores`, `recordatorio_enviado`, `fecha_recordatorio`, `consultorio_id`, `usuario_creador_id`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 4, 1, '2025-09-12 10:00:00', 60, 'seguimiento', 'no_asistio', 'Control mensual', 'Paciente refiere mejora en hábitos alimentarios', 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 22:19:07', '2025-09-14 22:04:12'),
(2, 3, 1, '2025-09-13 17:30:00', 45, 'primera_vez', 'no_asistio', 'Evaluación inicial', NULL, 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 22:19:08', '2025-09-14 22:04:12'),
(3, 4, 1, '2025-09-14 09:00:35', 60, 'seguimiento', 'completada', 'Control mensual', 'Paciente refiere mejora en hábitos alimentarios\nCita completada exitosamente.', 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 23:04:04', '2025-09-15 14:26:16'),
(4, 3, 1, '2025-09-13 14:30:00', 45, 'primera_vez', 'no_asistio', 'Evaluación inicial', NULL, 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 23:04:04', '2025-09-14 22:04:12'),
(5, 1, 1, '2025-09-16 18:00:00', 60, 'seguimiento', 'no_asistio', 'nada', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-13 22:56:26', '2025-09-18 13:40:28'),
(6, 5, 1, '2025-09-15 21:00:00', 60, 'control', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-13 23:18:02', '2025-09-16 17:40:10'),
(7, 6, 1, '2025-09-17 02:00:00', 60, 'seguimiento', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 00:11:10', '2025-09-18 13:40:28'),
(8, 2, 1, '2025-09-16 00:00:00', 60, 'seguimiento', 'no_asistio', 'prueba horario', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 00:24:56', '2025-09-16 17:40:10'),
(9, 1, 1, '2025-09-19 16:00:00', 60, 'control', 'completada', 'prueba horario', '', NULL, 0, NULL, 1, 1, '2025-09-14 01:15:27', '2025-09-19 14:12:55'),
(10, 1, 1, '2025-09-16 23:00:00', 60, 'control', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 13:07:44', '2025-09-18 13:40:28'),
(11, 1, 1, '2025-09-16 09:00:00', 60, 'seguimiento', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 13:39:08', '2025-09-16 17:40:10'),
(12, 2, 1, '2025-09-17 12:00:00', 45, 'primera_vez', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 13:47:42', '2025-09-18 13:40:28'),
(13, 6, 1, '2025-09-14 22:00:00', 30, 'urgencia', 'completada', '', '', 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-14 20:56:16', '2025-09-15 14:25:56'),
(14, 6, 1, '2025-09-17 04:00:00', 60, 'seguimiento', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 22:38:53', '2025-09-18 13:40:28'),
(15, 6, 1, '2025-09-20 19:00:00', 60, 'seguimiento', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 22:53:48', '2025-09-20 23:37:35'),
(16, 6, 1, '2025-09-30 14:00:00', 30, 'urgencia', 'confirmada', 'prueba de horario ', '', NULL, 0, NULL, 1, 1, '2025-09-15 11:38:10', '2025-09-20 23:45:24'),
(17, 6, 1, '2025-09-25 20:20:00', 45, 'seguimiento', 'programada', 'prueba desde el form de paciente', '', NULL, 0, NULL, 1, 1, '2025-09-21 19:22:12', '2025-09-21 19:22:12');

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
(6, 'tema_color_primario', '#1976d2', 'string', 'Color primario del tema', 'interfaz', 1, '2025-09-18 10:25:06'),
(7, 'mostrar_demo', 'true', 'boolean', 'Mostrar datos de demostración', 'general', 1, '2025-09-10 12:35:00'),
(8, 'email_habilitado', 'false', 'boolean', 'Habilitar/deshabilitar el envío de emails del sistema', 'notificaciones', 0, '2025-09-21 13:55:30'),
(9, 'email_host', 'smtp.gmail.com', 'string', 'Servidor SMTP para envío de emails', 'notificaciones', 0, '2025-09-18 10:09:08'),
(10, 'email_puerto', '587', 'number', 'Puerto del servidor SMTP', 'notificaciones', 0, '2025-09-18 10:09:08'),
(11, 'email_usuario', 'guslozua@gmail.com', 'string', 'Usuario/email para autenticación SMTP', 'notificaciones', 0, '2025-09-18 10:48:21'),
(12, 'email_password', 'qwkg evmu jydl mqqq', 'string', 'Contraseña para autenticación SMTP', 'notificaciones', 0, '2025-09-18 10:48:21'),
(13, 'email_seguridad', 'TLS', 'string', 'Tipo de seguridad SMTP (TLS/SSL/NONE)', 'notificaciones', 0, '2025-09-18 10:09:08'),
(14, 'email_remitente_nombre', 'Alimetria', 'string', 'Nombre que aparece como remitente', 'notificaciones', 0, '2025-09-18 10:48:21'),
(15, 'email_remitente_direccion', 'guslozua@gmail.com', 'string', 'Dirección email del remitente', 'notificaciones', 0, '2025-09-18 10:48:21'),
(16, 'recordatorios_automaticos', 'true', 'boolean', 'Enviar recordatorios automáticos de citas', 'notificaciones', 0, '2025-09-18 10:09:08'),
(17, 'notificaciones_cumpleanos', 'true', 'boolean', 'Enviar felicitaciones de cumpleaños a pacientes', 'notificaciones', 0, '2025-09-18 10:09:08'),
(18, 'backup_automatico', 'false', 'boolean', 'Realizar respaldos automáticos de la base de datos', 'sistema', 0, '2025-09-18 10:09:08'),
(19, 'backup_frecuencia_dias', '7', 'number', 'Frecuencia de respaldo automático en días', 'sistema', 0, '2025-09-18 10:09:08'),
(20, 'backup_hora', '02:00', 'string', 'Hora del día para ejecutar respaldos (formato 24h)', 'sistema', 0, '2025-09-18 10:09:08'),
(21, 'sesion_duracion_horas', '8', 'number', 'Duración máxima de la sesión en horas', 'seguridad', 0, '2025-09-18 10:09:08'),
(22, 'intentos_login_max', '5', 'number', 'Máximo intentos de login fallidos antes de bloqueo', 'seguridad', 0, '2025-09-18 10:09:08'),
(23, 'bloqueo_duracion_minutos', '30', 'number', 'Duración del bloqueo por intentos fallidos (minutos)', 'seguridad', 0, '2025-09-18 10:09:08'),
(24, 'tema_modo_oscuro', 'false', 'boolean', 'Habilitar modo oscuro por defecto', 'interfaz', 1, '2025-09-18 10:09:08'),
(25, 'logo_url', '', 'string', 'URL del logo personalizado del consultorio', 'interfaz', 1, '2025-09-18 10:09:08'),
(26, 'fecha_formato', 'DD/MM/YYYY', 'string', 'Formato de fecha preferido (DD/MM/YYYY o MM/DD/YYYY)', 'interfaz', 1, '2025-09-18 10:09:08'),
(27, 'reportes_incluir_graficos', 'true', 'boolean', 'Incluir gráficos en reportes PDF por defecto', 'reportes', 0, '2025-09-18 10:09:08'),
(28, 'reportes_marca_agua', 'true', 'boolean', 'Agregar marca de agua con nombre del consultorio', 'reportes', 0, '2025-09-18 10:09:08'),
(29, 'citas_duracion_default', '60', 'number', 'Duración por defecto de las citas en minutos', 'citas', 0, '2025-09-18 10:09:08'),
(30, 'citas_recordatorio_horas', '24', 'number', 'Horas antes de la cita para enviar recordatorio', 'citas', 0, '2025-09-18 10:09:08'),
(31, 'citas_cancelacion_horas_min', '2', 'number', 'Horas mínimas para cancelar una cita', 'citas', 0, '2025-09-18 10:09:08');

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
(1, 'Consultorio Principal', 'Dirección del consultorio', '(000) 000-0000', 'info@alimetria.com', 1, NULL, '2025-09-10 12:35:00', '2025-09-10 12:35:00'),
(2, 'Consultorio01', 'avenida Silvano Bores 297', '03816888888', 'consultorio02@alimetria.com', 1, NULL, '2025-09-17 21:21:07', '2025-09-17 22:29:05');

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

--
-- Volcado de datos para la tabla `fotos_pacientes`
--

INSERT INTO `fotos_pacientes` (`id`, `paciente_id`, `ruta_imagen`, `tipo_foto`, `descripcion`, `peso_momento`, `medicion_relacionada_id`, `fecha`, `usuario_id`, `activo`) VALUES
(1, 6, 'evolucion-paciente-6-1758496997012-215447.jpeg', 'frontal', 'priemar foto, prueba', '105.00', NULL, '2025-09-21 20:23:17', 1, 1),
(2, 6, 'evolucion-paciente-6-1758497855822-587947.jpg', 'frontal', '2 foto', '105.00', NULL, '2025-09-21 20:37:35', 1, 1);

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
(6, 4, '2025-08-27 12:44:56', 'manual', '50.20', '158.50', '19.98', '16.20', NULL, '26.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Peso bajo - plan de aumento', NULL, NULL, 1, 8, 1, '2025-09-10 12:44:56', '2025-09-12 21:46:17'),
(7, 5, '2025-08-31 12:44:56', 'manual', '78.40', '172.80', '26.30', '19.50', NULL, '34.10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Evaluación de rutina', NULL, NULL, NULL, 1, 1, '2025-09-10 12:44:56', '2025-09-10 12:44:56'),
(8, 6, '2025-09-13 03:44:04', 'manual', '101.00', '180.00', '31.17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 0, '2025-09-12 21:44:20', '2025-09-12 21:53:47'),
(9, 6, '2025-09-13 09:53:52', 'manual', '102.90', '180.00', '31.76', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 0, '2025-09-12 21:54:06', '2025-09-13 00:12:08'),
(10, 6, '2025-09-15 18:52:08', 'inbody', '100.00', '180.00', '30.86', '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', NULL, NULL, 1, 1, 0, '2025-09-15 15:52:08', '2025-09-15 15:58:20'),
(11, 6, '2025-09-15 16:05:36', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757963131769-36226779.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 16:05:36', '2025-09-15 16:08:41'),
(12, 6, '2025-09-15 16:10:17', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757963413196-662694568.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 16:10:17', '2025-09-15 17:46:02'),
(13, 6, '2025-09-15 17:46:22', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757969173964-467325571.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 17:46:22', '2025-09-15 17:49:01'),
(14, 6, '2025-09-15 17:49:29', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757969364766-941571158.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 17:49:29', '2025-09-15 18:05:35'),
(15, 6, '2025-09-15 18:06:23', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757970377936-561322689.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 18:06:23', '2025-09-15 21:25:03'),
(16, 6, '2025-09-15 21:26:58', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757982411245-667668885.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 21:26:58', '2025-09-15 21:43:07'),
(17, 6, '2025-09-15 21:45:27', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757983520967-247374003.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 21:45:27', '2025-09-15 21:47:03'),
(18, 6, '2025-09-15 21:47:28', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757983644293-225963878.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 21:47:28', '2025-09-15 21:47:56'),
(19, 6, '2025-09-15 21:48:15', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757983692443-616730882.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 21:48:15', '2025-09-15 21:55:48'),
(20, 6, '2025-09-15 21:57:49', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757984265266-706470103.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 21:57:49', '2025-09-15 22:14:46'),
(21, 6, '2025-09-15 22:25:45', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757985937872-316798629.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 22:25:45', '2025-09-15 22:40:31'),
(22, 6, '2025-09-15 22:41:06', 'inbody', NULL, NULL, NULL, '33.80', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', 'inbody-1757986859421-593651980.jpeg', '{\"peso\":null,\"masa_muscular\":null,\"grasa_corporal\":null,\"grasa_corporal_kg\":null,\"imc\":null,\"porcentaje_grasa\":33.8,\"agua_corporal\":null,\"metabolismo_basal\":null,\"puntuacion_corporal\":66,\"fecha_medicion\":null,\"usuario_nombre\":null,\"masa_osea\":null,\"grasa_visceral\":null,\"edad_metabolica\":null,\"raw_text\":\"Peso                  InBody\\n105.0, e =    08.09.2025\\n\\nBajo     Normal               Alto\\n+0.2                                                                                                                     16:41\\nGuslozua\\n\\nMasa muscular\\n\\n39.4,, e\\n\\n+0.3                   Bajo     Normal               Alto\\n\\nGrasa corporal\\n\\n355 A\\n\\n-0.3                 Bajo    Normal            Alto\\n\\nIMC\\n\\n324y EE\\n+0.1                    Bajo     Normal               Alto\\n\\nPorcentaje de grasa corporal\\n\\n33.8 %      -H-                    66 Puntos\\n\\n-0.4                Bajo    Normal            Alto                     superior 89.0%\\n\"}', 1, 1, 0, '2025-09-15 22:41:06', '2025-09-15 22:45:45'),
(23, 6, '2025-09-16 01:53:28', 'inbody', '105.00', '180.00', '32.41', '33.80', NULL, '39.40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 66, NULL, 'Advertencias OCR: Peso fuera del rango normal (30-300 kg), IMC fuera del rango normal (10-60)', NULL, NULL, NULL, 1, 1, '2025-09-15 22:53:28', '2025-09-15 22:54:42');

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

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `tipo`, `titulo`, `mensaje`, `destinatario_id`, `paciente_relacionado_id`, `cita_relacionada_id`, `leida`, `enviado_email`, `fecha_programada`, `fecha_enviada`, `fecha_leida`, `activo`) VALUES
(1, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el lunes, 15 de septiembre de 2025, 17:00.', 1, 2, 8, 1, 1, '2025-09-14 17:00:00', '2025-09-14 23:35:05', '2025-09-19 17:33:16', 1),
(2, 'sistema', 'Sistema de notificaciones activo', 'El sistema de notificaciones de Alimetria está funcionando correctamente. Esta es una notificación de prueba.', 1, NULL, NULL, 1, 1, '2025-09-14 00:55:30', '2025-09-14 23:35:03', '2025-09-16 00:21:27', 1),
(3, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el viernes, 19 de septiembre de 2025, 16:00.', 1, 1, 9, 1, 1, '2025-09-18 16:00:00', '2025-09-18 16:00:02', '2025-09-19 17:33:18', 1),
(4, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el lunes, 15 de septiembre de 2025, 17:00.', 1, 1, 10, 1, 1, '2025-09-14 17:00:00', '2025-09-14 23:35:08', '2025-09-16 00:21:44', 1),
(5, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el miércoles, 17 de septiembre de 2025, 12:00.', 1, 2, 12, 0, 0, '2025-09-16 12:00:00', NULL, NULL, 0),
(6, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el miércoles, 17 de septiembre de 2025, 15:00.', 1, 6, 14, 1, 1, '2025-09-16 15:00:00', '2025-09-16 15:00:03', '2025-09-18 13:33:51', 1),
(7, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el sábado, 20 de septiembre de 2025, 19:00.', 1, 6, 15, 0, 1, '2025-09-19 19:00:00', '2025-09-19 19:00:03', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obras_sociales`
--

CREATE TABLE `obras_sociales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código identificatorio de la obra social',
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `obras_sociales`
--

INSERT INTO `obras_sociales` (`id`, `nombre`, `codigo`, `descripcion`, `telefono`, `email`, `sitio_web`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'PARTICULAR', 'PART', 'Paciente particular sin cobertura de obra social', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(2, 'OSDE', 'OSDE', 'Organización de Servicios Directos Empresarios', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(3, 'SWISS MEDICAL', 'SWISS', 'Swiss Medical Group', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(4, 'MEDICUS', 'MEDICUS', 'Medicus S.A.', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(5, 'IOMA', 'IOMA', 'Instituto de Obra Médico Asistencial', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(6, 'PAMI', 'PAMI', 'Programa de Atención Médica Integral', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(7, 'OSECAC', 'OSECAC', 'Obra Social de Empleados de Comercio y Actividades Civiles', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(8, 'OSPLAD', 'OSPLAD', 'Obra Social del Personal de la Alimentación', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(9, 'OSPRERA', 'OSPRERA', 'Obra Social del Personal Rural y Estibadores de la República Argentina', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(10, 'OSDEPYM', 'OSDEPYM', 'Obra Social de Directivos de Empresas Privadas y Mixtas', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(11, 'OSPAT', 'OSPAT', 'Obra Social del Personal de la Actividad del Turf', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(12, 'OSUTHGRA', 'OSUTHGRA', 'Obra Social de la Unión Trabajadores del Turismo, Hoteleros y Gastronómicos', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(13, 'OSCHOCA', 'OSCHOCA', 'Obra Social de Choferes de Camiones y Afines', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(14, 'OSPATCA', 'OSPATCA', 'Obra Social del Personal Auxiliar de Casas Particulares', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(15, 'GALENO', 'GALENO', 'Galeno Argentina S.A.', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(16, 'HOSPITAL BRITANICO', 'BRITANIC', 'Hospital Británico de Buenos Aires', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(17, 'HOSPITAL ITALIANO', 'ITALIANO', 'Hospital Italiano de Buenos Aires', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(18, 'SANCOR SALUD', 'SANCOR', 'Sancor Cooperativa de Seguros Ltda.', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(19, 'ACCORD SALUD', 'ACCORD', 'Accord Salud S.A.', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(20, 'PREVENCION SALUD', 'PREVENCION', 'Prevención Salud', NULL, NULL, NULL, 1, '2025-09-11 17:41:20', '2025-09-11 17:41:20'),
(21, 'ObraSOCIAL PRUEBITA', 'PRUEB', 'nada para bborrar despues', '09876225631', 'pru@gmail.com', NULL, 0, '2025-09-18 09:27:51', '2025-09-18 09:30:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sexo` enum('M','F','O','N') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M=Masculino, F=Femenino, O=Otro/No binario, N=Prefiero no especificar',
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
  `obra_social_id` int(11) DEFAULT NULL,
  `numero_afiliado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultorio_id` int(11) DEFAULT NULL,
  `usuario_creador_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `sexo`, `fecha_nacimiento`, `telefono`, `email`, `direccion`, `ocupacion`, `foto_perfil`, `altura_inicial`, `peso_inicial`, `objetivo`, `observaciones_generales`, `obra_social_id`, `numero_afiliado`, `consultorio_id`, `usuario_creador_id`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Juan', 'Pérez', 'M', '1985-03-15', '(381) 123-4567', 'juan.perez@email.com', 'Av. Independencia 123, San Miguel de Tucumán', 'Ingeniero', NULL, '175.50', '82.30', 'Reducir peso y mejorar condición física', NULL, 1, NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-11 17:41:20'),
(2, 'María', 'González', 'F', '1990-07-22', '(381) 234-5678', 'maria.gonzalez@email.com', 'Calle Muñecas 456, Tucumán', 'Profesora', NULL, '162.00', '68.50', 'Mantener peso saludable y tonificar', NULL, 12, '124535325345', 1, 1, 1, '2025-09-10 12:44:56', '2025-09-11 18:02:58'),
(3, 'Carlitos', 'Rodríguez', 'M', '1978-11-08', '(381) 345-6789', 'carlos.rodriguez@email.com', 'Barrio Norte, Tucumán', 'Contador', NULL, '180.20', '95.70', 'Perder peso por recomendación médica', NULL, 1, NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-11 17:41:20'),
(4, 'Anita', 'Martínez', 'F', '1995-02-14', '(381) 456-7890', 'ana.martinez@email.com', 'Villa Mariano Moreno, Tucumán', 'Estudiante', NULL, '158.50', '55.20', 'Ganar masa muscular', NULL, 1, NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-11 17:41:20'),
(5, 'Roberto', 'Silva', 'M', '1988-09-30', '(381) 567-8901', 'roberto.silva@email.com', 'Centro, San Miguel de Tucumán', 'Comerciante', NULL, '172.80', '78.40', 'Mejorar composición corporal', NULL, 1, NULL, 1, 1, 1, '2025-09-10 12:44:56', '2025-09-11 17:41:20'),
(6, 'Sergio', 'Lozua', 'M', '1977-07-27', '03816503889', 'sdgsdg@sgsdg.com', 'Avenida silvano Bores 297', 'va', 'paciente-6-1758424426910.jpg', '180.00', '105.00', NULL, NULL, 3, '1234567833', NULL, 1, 1, '2025-09-11 09:58:30', '2025-09-21 13:53:22');

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
(3, 'secretario', 'Personal administrativo', '{\"pacientes\":[\"crear\",\"leer\"],\"citas\":[\"crear\",\"leer\",\"actualizar\"],\"reportes\":[\"leer\"]}', 1, '2025-09-10 12:35:00', '2025-09-17 20:23:51'),
(4, 'paciente', 'Paciente del consultorio', '{\"perfil_propio\":[\"leer\"],\"mediciones_propias\":[\"leer\"],\"citas_propias\":[\"leer\"]}', 1, '2025-09-10 12:35:00', '2025-09-10 12:35:00'),
(5, 'rol prueba', 'rol de prueba', '{\"pacientes\":[\"leer\"]}', 0, '2025-09-17 20:24:18', '2025-09-17 20:35:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suplementos`
--

CREATE TABLE `suplementos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_cientifico` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_id` int(11) NOT NULL,
  `descripcion_corta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion_detallada` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `para_que_sirve` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beneficios_principales` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`beneficios_principales`)),
  `dosis_recomendada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dosis_minima` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dosis_maxima` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `forma_presentacion` enum('cápsula','tableta','polvo','líquido','goma','inyectable','tópico') COLLATE utf8mb4_unicode_ci DEFAULT 'cápsula',
  `frecuencia_recomendada` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mejor_momento_toma` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion_tratamiento_tipica` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `popularidad_uso` int(11) DEFAULT 0,
  `nivel_evidencia` enum('alta','media','baja','experimental') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `precio_referencial` decimal(8,2) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `destacado` tinyint(4) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla principal con información básica de suplementos';

--
-- Volcado de datos para la tabla `suplementos`
--

INSERT INTO `suplementos` (`id`, `nombre`, `nombre_cientifico`, `categoria_id`, `descripcion_corta`, `descripcion_detallada`, `para_que_sirve`, `beneficios_principales`, `dosis_recomendada`, `dosis_minima`, `dosis_maxima`, `forma_presentacion`, `frecuencia_recomendada`, `mejor_momento_toma`, `duracion_tratamiento_tipica`, `popularidad_uso`, `nivel_evidencia`, `precio_referencial`, `activo`, `destacado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Multivitamínicos', NULL, 1, 'Combinación de vitaminas y minerales esenciales en una sola fórmula', 'Los multivitamínicos son suplementos que contienen una combinación de vitaminas y minerales esenciales que el cuerpo necesita para funcionar correctamente. Están diseñados para complementar la dieta cuando no se obtienen suficientes nutrientes de los alimentos.', 'Personas con dietas poco equilibradas, adultos mayores, pacientes en recuperación, personas con restricciones alimentarias', '[\"Corrige deficiencias nutricionales\", \"Mejora energía y vitalidad\", \"Apoya sistema inmune\", \"Facilita metabolismo celular\", \"Previene anemias por deficiencia\"]', '1 tableta al día con la comida principal', NULL, NULL, 'tableta', '1 vez al día', 'Con desayuno o almuerzo', 'Uso continuo', 82, 'alta', NULL, 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(2, 'Vitamina D3', NULL, 1, 'Vitamina esencial para la salud ósea, sistema inmune y regulación hormonal', 'La vitamina D3 (colecalciferol) es crucial para la absorción de calcio, el fortalecimiento óseo y tiene funciones importantes en el sistema inmune y la regulación hormonal. La deficiencia es muy común debido a la falta de exposición solar.', 'Deficiencia muy común en adultos, personas con poca exposición solar, osteoporosis, síndrome metabólico', '[\"Fortalece huesos y dientes\", \"Mejora absorción de calcio\", \"Apoya sistema inmunológico\", \"Regula estado de ánimo\", \"Previene osteoporosis\"]', '1000-4000 UI por día (según niveles en sangre)', NULL, NULL, 'cápsula', '1 vez al día', 'Con una comida que contenga grasas', 'Uso continuo con monitoreo', 88, 'alta', NULL, 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(3, 'Omega 3 (EPA/DHA)', NULL, 4, 'Ácidos grasos esenciales para la salud cardiovascular, función cerebral y control de inflamación', 'Los ácidos grasos Omega 3, especialmente EPA y DHA, son fundamentales para la salud cardiovascular, función cerebral, desarrollo ocular y control de procesos inflamatorios. El cuerpo no puede producirlos, por lo que deben obtenerse de la dieta o suplementación.', 'Hipercolesterolemia, triglicéridos altos, riesgo cardiovascular, deportistas, función cognitiva, inflamación crónica', '[\"Reduce colesterol y triglicéridos\", \"Protege corazón y arterias\", \"Mejora función cerebral\", \"Reduce inflamación\", \"Apoya salud ocular\", \"Mejora estado de ánimo\"]', '1-3 gramos de EPA/DHA por día', NULL, NULL, 'cápsula', '1-2 veces al día', 'Con las comidas principales', 'Uso continuo', 95, 'alta', NULL, 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(4, 'Proteína en Polvo', NULL, 3, 'Suplemento proteico para construcción y reparación muscular', 'Las proteínas en polvo (suero, vegetal, caseína) proporcionan aminoácidos esenciales necesarios para la síntesis de proteínas musculares, recuperación post-ejercicio y mantenimiento de masa muscular, especialmente útil cuando la ingesta dietética es insuficiente.', 'Deportistas, pacientes con sarcopenia, recuperación post-quirúrgica, adultos mayores, dietas hiperproteicas', '[\"Construye y repara músculos\", \"Acelera recuperación post-ejercicio\", \"Mantiene masa muscular\", \"Facilita pérdida de grasa\", \"Mejora composición corporal\"]', '25-50 gramos por porción (1-2 porciones/día)', NULL, NULL, 'polvo', '1-3 veces al día', 'Post-entreno y entre comidas', 'Según objetivos (3-6 meses típico)', 75, 'alta', NULL, 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(5, 'Calcio', NULL, 2, 'Mineral esencial para la salud ósea, muscular y función nerviosa', 'El calcio es el mineral más abundante en el cuerpo y es fundamental para la formación y mantenimiento de huesos y dientes. También juega roles críticos en la contracción muscular, función nerviosa y coagulación sanguínea.', 'Osteopenia, osteoporosis, mujeres postmenopáusicas, adolescentes en crecimiento, deficiencia dietética', '[\"Fortalece huesos y dientes\", \"Previene osteoporosis\", \"Mejora contracción muscular\", \"Apoya función nerviosa\", \"Ayuda en coagulación\"]', '500-1200 mg por día (según edad y sexo)', NULL, NULL, 'tableta', '2-3 veces al día', 'Con comidas para mejor absorción', 'Uso continuo', 58, 'alta', NULL, 1, 0, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(6, 'Hierro', NULL, 2, 'Mineral esencial para la prevención y tratamiento de anemia ferropénica', 'El hierro es crucial para la formación de hemoglobina y el transporte de oxígeno en sangre. La deficiencia de hierro es una de las carencias nutricionales más comunes, especialmente en mujeres en edad fértil.', 'Mujeres en edad fértil, embarazadas, vegetarianos estrictos, anemia ferropénica, donantes frecuentes de sangre', '[\"Previene y trata anemia\", \"Mejora transporte de oxígeno\", \"Reduce fatiga y cansancio\", \"Apoya función cognitiva\", \"Fortalece sistema inmune\"]', '18-65 mg por día (según deficiencia)', NULL, NULL, 'tableta', '1 vez al día', 'En ayunas o con vitamina C', '3-6 meses bajo supervisión', 65, 'alta', NULL, 1, 0, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(7, 'Probióticos', NULL, 5, 'Bacterias beneficiosas para el equilibrio de la microbiota intestinal', 'Los probióticos son microorganismos vivos que, cuando se administran en cantidades adecuadas, confieren beneficios para la salud del huésped, principalmente mejorando el equilibrio de la microbiota intestinal.', 'Disbiosis intestinal, post-tratamiento antibiótico, síndrome de intestino irritable, diarreas, apoyo inmunológico', '[\"Equilibra microbiota intestinal\", \"Mejora digestión\", \"Fortalece sistema inmune\", \"Reduce inflamación intestinal\", \"Previene diarreas\"]', '1-10 billones de UFC por día', NULL, NULL, 'cápsula', '1-2 veces al día', 'Con o sin comida (según cepa)', '4-8 semanas iniciales', 78, 'media', NULL, 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(8, 'Colágeno Hidrolizado', NULL, 6, 'Proteína específica para la salud articular, piel y tejidos conectivos', 'El colágeno hidrolizado es una forma procesada de colágeno que se absorbe más fácilmente. Es la proteína más abundante en el cuerpo y componente principal de cartílagos, huesos, piel, tendones y ligamentos.', 'Artritis, desgaste articular, envejecimiento de la piel, recuperación de lesiones, estética anti-edad', '[\"Mejora salud articular\", \"Reduce dolor artrítico\", \"Fortalece piel y cabello\", \"Acelera cicatrización\", \"Mantiene elasticidad\"]', '10-20 gramos por día', NULL, NULL, 'polvo', '1 vez al día', 'En ayunas o antes de dormir', 'Mínimo 3 meses para ver efectos', 45, 'media', NULL, 1, 0, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(9, 'Creatina', NULL, 7, 'Compuesto que aumenta la fuerza, potencia y rendimiento muscular', 'La creatina es un compuesto natural que se encuentra en los músculos y ayuda a producir energía durante ejercicios de alta intensidad. Es uno de los suplementos deportivos más estudiados y efectivos.', 'Deportistas, entrenamiento de fuerza, adultos mayores con pérdida de masa muscular, deportes explosivos', '[\"Aumenta fuerza y potencia\", \"Mejora rendimiento anaeróbico\", \"Acelera recuperación\", \"Incrementa masa muscular\", \"Mejora función cognitiva\"]', '3-5 gramos por día', NULL, NULL, 'polvo', '1 vez al día', 'Post-entreno o cualquier momento', 'Uso continuo durante entrenamientos', 91, 'alta', NULL, 1, 1, '2025-09-22 00:03:41', '2025-09-22 00:04:34'),
(10, 'BCAA (Aminoácidos Ramificados)', NULL, 3, 'Aminoácidos esenciales que disminuyen la fatiga muscular y favorecen la recuperación', 'Los BCAA (Leucina, Isoleucina, Valina) son aminoácidos esenciales que el cuerpo no puede producir. Son especialmente importantes para la síntesis de proteínas musculares y pueden reducir la fatiga durante el ejercicio.', 'Deportistas en entrenamientos intensos, personas con dietas bajas en proteína, ejercicios de resistencia prolongados', '[\"Reduce fatiga muscular\", \"Acelera recuperación\", \"Previene catabolismo\", \"Mejora resistencia\", \"Apoya síntesis proteica\"]', '5-15 gramos por día (2:1:1 ratio)', NULL, NULL, 'polvo', '2-3 veces al día', 'Antes, durante y post-entreno', 'Durante períodos de entrenamiento intenso', 42, 'media', NULL, 1, 0, '2025-09-22 00:03:41', '2025-09-22 00:04:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suplemento_contraindicaciones`
--

CREATE TABLE `suplemento_contraindicaciones` (
  `id` int(11) NOT NULL,
  `suplemento_id` int(11) NOT NULL,
  `tipo` enum('contraindicacion','precaucion','advertencia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `poblacion_afectada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `severidad` enum('alta','media','baja') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contraindicaciones, precauciones y advertencias';

--
-- Volcado de datos para la tabla `suplemento_contraindicaciones`
--

INSERT INTO `suplemento_contraindicaciones` (`id`, `suplemento_id`, `tipo`, `descripcion`, `poblacion_afectada`, `severidad`, `activo`, `fecha_creacion`) VALUES
(1, 3, 'contraindicacion', 'Alergia conocida al pescado, mariscos o componentes del suplemento', 'Pacientes con alergias alimentarias', 'alta', 1, '2025-09-22 00:04:34'),
(2, 3, 'precaucion', 'Trastornos hemorrágicos activos o uso de anticoagulantes orales', 'Pacientes con warfarina, heparina, dabigatrán', 'alta', 1, '2025-09-22 00:04:34'),
(3, 3, 'precaucion', 'Cirugías programadas en las próximas 2 semanas', 'Pacientes pre-quirúrgicos', 'media', 1, '2025-09-22 00:04:34'),
(4, 3, 'advertencia', 'Puede elevar ligeramente los niveles de glucosa en sangre', 'Diabéticos tipo 2', 'baja', 1, '2025-09-22 00:04:34'),
(5, 3, 'precaucion', 'Interacción con medicamentos hipotensores', 'Pacientes hipertensos medicados', 'media', 1, '2025-09-22 00:04:34'),
(6, 2, 'contraindicacion', 'Hipercalcemia o niveles muy altos de vitamina D', 'Pacientes con vitamina D >80 ng/mL', 'alta', 1, '2025-09-22 00:04:34'),
(7, 2, 'precaucion', 'Cálculos renales de calcio recurrentes', 'Pacientes con nefrolitiasis', 'media', 1, '2025-09-22 00:04:34'),
(8, 2, 'precaucion', 'Sarcoidosis u otras enfermedades granulomatosas', 'Pacientes con trastornos del metabolismo del calcio', 'media', 1, '2025-09-22 00:04:34'),
(9, 2, 'advertencia', 'Interacción con diuréticos tiazídicos', 'Pacientes hipertensos con ciertos medicamentos', 'baja', 1, '2025-09-22 00:04:34'),
(10, 1, 'precaucion', 'Exceso de vitaminas liposolubles (A, D, E, K)', 'Personas que ya toman suplementos individuales', 'media', 1, '2025-09-22 00:04:34'),
(11, 1, 'precaucion', 'Hemochromatosis o sobrecarga de hierro', 'Pacientes con trastornos del metabolismo del hierro', 'alta', 1, '2025-09-22 00:04:34'),
(12, 1, 'advertencia', 'No reemplaza una dieta equilibrada', 'Población general', 'baja', 1, '2025-09-22 00:04:34'),
(13, 9, 'precaucion', 'Enfermedad renal preexistente', 'Pacientes con insuficiencia renal', 'alta', 1, '2025-09-22 00:04:34'),
(14, 9, 'precaucion', 'Deshidratación o ingesta insuficiente de agua', 'Deportistas en climas calurosos', 'media', 1, '2025-09-22 00:04:34'),
(15, 9, 'advertencia', 'Puede causar retención de agua inicial', 'Deportistas de deportes con categorías de peso', 'baja', 1, '2025-09-22 00:04:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suplemento_efectos_secundarios`
--

CREATE TABLE `suplemento_efectos_secundarios` (
  `id` int(11) NOT NULL,
  `suplemento_id` int(11) NOT NULL,
  `efecto_secundario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia` enum('muy_común','común','poco_común','raro','muy_raro') COLLATE utf8mb4_unicode_ci DEFAULT 'poco_común',
  `descripcion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manejo_recomendado` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Efectos adversos documentados';

--
-- Volcado de datos para la tabla `suplemento_efectos_secundarios`
--

INSERT INTO `suplemento_efectos_secundarios` (`id`, `suplemento_id`, `efecto_secundario`, `frecuencia`, `descripcion`, `manejo_recomendado`, `activo`, `fecha_creacion`) VALUES
(1, 3, 'Eructos con sabor a pescado', 'muy_común', 'Sabor desagradable post-ingesta', 'Tomar con comidas, refrigerar el producto, elegir forma entérica', 1, '2025-09-22 00:04:34'),
(2, 3, 'Náuseas leves', 'común', 'Malestar estomacal especialmente en ayunas', 'Tomar siempre con alimentos', 1, '2025-09-22 00:04:34'),
(3, 3, 'Diarrea leve', 'común', 'Heces blandas, especialmente con dosis altas', 'Reducir dosis temporalmente, aumentar gradualmente', 1, '2025-09-22 00:04:34'),
(4, 3, 'Dolor abdominal', 'poco_común', 'Molestias digestivas', 'Tomar con comidas abundantes', 1, '2025-09-22 00:04:34'),
(5, 3, 'Mal aliento', 'poco_común', 'Halitosis transitoria', 'Mejorar higiene oral, tomar con comidas', 1, '2025-09-22 00:04:34'),
(6, 3, 'Sangrado prolongado', 'raro', 'Tiempo de coagulación aumentado', 'Suspender y consultar médico inmediatamente', 1, '2025-09-22 00:04:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suplemento_indicaciones`
--

CREATE TABLE `suplemento_indicaciones` (
  `id` int(11) NOT NULL,
  `suplemento_id` int(11) NOT NULL,
  `indicacion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `perfil_paciente` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nivel_recomendacion` enum('alta','media','baja') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `notas_adicionales` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Indicaciones terapéuticas específicas de cada suplemento';

--
-- Volcado de datos para la tabla `suplemento_indicaciones`
--

INSERT INTO `suplemento_indicaciones` (`id`, `suplemento_id`, `indicacion`, `perfil_paciente`, `nivel_recomendacion`, `notas_adicionales`, `activo`, `fecha_creacion`) VALUES
(1, 3, 'Hipercolesterolemia', 'Adultos con colesterol LDL >160 mg/dL', 'alta', 'Especialmente efectivo para reducir triglicéridos', 1, '2025-09-22 00:04:34'),
(2, 3, 'Triglicéridos elevados', 'Pacientes con triglicéridos >200 mg/dL', 'alta', 'Dosis altas (2-4g) pueden ser necesarias', 1, '2025-09-22 00:04:34'),
(3, 3, 'Prevención cardiovascular primaria', 'Adultos >40 años con factores de riesgo', 'media', 'Combinar con dieta mediterránea', 1, '2025-09-22 00:04:34'),
(4, 3, 'Artritis reumatoide', 'Pacientes con inflamación crónica articular', 'media', 'Efectos anti-inflamatorios documentados', 1, '2025-09-22 00:04:34'),
(5, 3, 'Depresión leve-moderada', 'Como terapia complementaria', 'baja', 'Usar junto con tratamiento convencional', 1, '2025-09-22 00:04:34'),
(6, 3, 'Embarazo y lactancia', 'Mujeres embarazadas y lactantes', 'alta', 'Importante para desarrollo neurológico fetal', 1, '2025-09-22 00:04:34'),
(7, 2, 'Deficiencia de vitamina D', 'Población general con niveles <20 ng/mL', 'alta', 'Muy común en países con poca exposición solar', 1, '2025-09-22 00:04:34'),
(8, 2, 'Osteoporosis', 'Mujeres postmenopáusicas y hombres >70 años', 'alta', 'Esencial junto con calcio', 1, '2025-09-22 00:04:34'),
(9, 2, 'Apoyo inmunológico', 'Personas con infecciones respiratorias frecuentes', 'media', 'Especialmente en otoño/invierno', 1, '2025-09-22 00:04:34'),
(10, 2, 'Síndrome metabólico', 'Pacientes con diabetes tipo 2 y obesidad', 'media', 'Mejora sensibilidad a insulina', 1, '2025-09-22 00:04:34'),
(11, 1, 'Dietas restrictivas o desequilibradas', 'Personas con alimentación limitada', 'alta', 'Especialmente útil en dietas veganas o muy restrictivas', 1, '2025-09-22 00:04:34'),
(12, 1, 'Adultos mayores', 'Personas >65 años con pérdida de apetito', 'alta', 'Absorción reducida con la edad', 1, '2025-09-22 00:04:34'),
(13, 1, 'Embarazo y lactancia', 'Mujeres gestantes y lactantes', 'media', 'Complementar ácido fólico específico', 1, '2025-09-22 00:04:34'),
(14, 1, 'Recuperación post-enfermedad', 'Pacientes en convalecencia', 'media', 'Apoyo nutricional temporal', 1, '2025-09-22 00:04:34'),
(15, 9, 'Entrenamiento de fuerza y potencia', 'Deportistas de disciplinas anaeróbicas', 'alta', 'Uno de los suplementos más estudiados', 1, '2025-09-22 00:04:34'),
(16, 9, 'Sarcopenia', 'Adultos mayores con pérdida de masa muscular', 'media', 'Combinar con ejercicio de resistencia', 1, '2025-09-22 00:04:34'),
(17, 9, 'Deportes explosivos', 'Atletas de sprint, levantamiento de pesas', 'alta', 'Máxima efectividad en ejercicios <30 segundos', 1, '2025-09-22 00:04:34'),
(18, 9, 'Recuperación muscular', 'Deportistas en entrenamientos intensos', 'media', 'Reduce daño muscular y acelera recuperación', 1, '2025-09-22 00:04:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suplemento_interacciones`
--

CREATE TABLE `suplemento_interacciones` (
  `id` int(11) NOT NULL,
  `suplemento_id` int(11) NOT NULL,
  `tipo_interaccion` enum('medicamento','suplemento','alimento') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_interaccion` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_interaccion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `severidad` enum('grave','moderada','leve') COLLATE utf8mb4_unicode_ci DEFAULT 'moderada',
  `recomendacion` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Interacciones con medicamentos, otros suplementos y alimentos';

--
-- Volcado de datos para la tabla `suplemento_interacciones`
--

INSERT INTO `suplemento_interacciones` (`id`, `suplemento_id`, `tipo_interaccion`, `nombre_interaccion`, `descripcion_interaccion`, `severidad`, `recomendacion`, `activo`, `fecha_creacion`) VALUES
(1, 3, 'medicamento', 'Warfarina', 'Puede aumentar el efecto anticoagulante y riesgo de sangrado', 'grave', 'Monitorear INR frecuentemente, ajustar dosis si necesario', 1, '2025-09-22 00:04:34'),
(2, 3, 'medicamento', 'Aspirina', 'Efecto aditivo antitrombótico, mayor riesgo de sangrado', 'moderada', 'Vigilar signos de sangrado, considerar dosis menores', 1, '2025-09-22 00:04:34'),
(3, 3, 'medicamento', 'Antihipertensivos', 'Puede potenciar el efecto hipotensor', 'leve', 'Monitorizar presión arterial regularmente', 1, '2025-09-22 00:04:34'),
(4, 3, 'medicamento', 'Estatinas', 'Efecto sinérgico en reducción de lípidos', 'leve', 'Combinación beneficiosa, monitorear perfil lipídico', 1, '2025-09-22 00:04:34'),
(5, 3, 'suplemento', 'Vitamina E', 'Efecto antioxidante sinérgico, previene oxidación del omega 3', 'leve', 'Combinación recomendada', 1, '2025-09-22 00:04:34'),
(6, 3, 'alimento', 'Alcohol (exceso)', 'Puede reducir la absorción y aumentar oxidación', 'leve', 'Moderar consumo de alcohol, separar tomas', 1, '2025-09-22 00:04:34'),
(7, 9, 'medicamento', 'Diuréticos', 'Puede aumentar riesgo de deshidratación', 'moderada', 'Aumentar ingesta de agua significativamente', 1, '2025-09-22 00:04:34'),
(8, 9, 'suplemento', 'Cafeína (altas dosis)', 'Puede reducir efectividad de la creatina', 'leve', 'Separar tomas o moderar cafeína', 1, '2025-09-22 00:04:34'),
(9, 9, 'alimento', 'Carbohidratos simples', 'Mejora la captación muscular de creatina', 'leve', 'Tomar con jugo o dextrosa para mejor absorción', 1, '2025-09-22 00:04:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suplemento_referencias`
--

CREATE TABLE `suplemento_referencias` (
  `id` int(11) NOT NULL,
  `suplemento_id` int(11) NOT NULL,
  `titulo_estudio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `autores` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revista_publicacion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `año_publicacion` year(4) DEFAULT NULL,
  `tipo_estudio` enum('ensayo_clinico','revision_sistematica','meta_analisis','observacional','caso_control') COLLATE utf8mb4_unicode_ci DEFAULT 'observacional',
  `url_referencia` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resumen_hallazgos` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calidad_evidencia` enum('alta','moderada','baja','muy_baja') COLLATE utf8mb4_unicode_ci DEFAULT 'moderada',
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Referencias científicas y evidencia clínica';

--
-- Volcado de datos para la tabla `suplemento_referencias`
--

INSERT INTO `suplemento_referencias` (`id`, `suplemento_id`, `titulo_estudio`, `autores`, `revista_publicacion`, `año_publicacion`, `tipo_estudio`, `url_referencia`, `resumen_hallazgos`, `calidad_evidencia`, `activo`, `fecha_creacion`) VALUES
(1, 3, 'Cardiovascular effects of marine omega-3 fatty acids', 'Mozaffarian D, Wu JH', 'New England Journal of Medicine', 2019, 'revision_sistematica', 'https://www.nejm.org/', 'Reducción significativa de eventos cardiovasculares mayores con EPA/DHA >1g/día', 'alta', 1, '2025-09-22 00:04:34'),
(2, 3, 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease', 'Abdelhamid AS, et al.', 'Cochrane Database', 2020, 'meta_analisis', 'https://www.cochrane.org/', 'Evidencia moderada de beneficio en prevención secundaria cardiovascular', 'alta', 1, '2025-09-22 00:04:34'),
(3, 3, 'Marine n-3 polyunsaturated fatty acids and coronary heart disease', 'Harris WS, et al.', 'Atherosclerosis', 2021, 'ensayo_clinico', '', 'EPA de alta dosis reduce eventos cardiovasculares en 25%', 'alta', 1, '2025-09-22 00:04:34'),
(4, 3, 'Omega-3 supplementation and depression: systematic review', 'Freeman MP, et al.', 'JAMA Psychiatry', 2020, 'revision_sistematica', '', 'Efecto modesto pero significativo en depresión mayor', 'moderada', 1, '2025-09-22 00:04:34');

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
(1, 'Gus', 'Lozua', 'sglozua@gmail.com', '$2a$12$Re3dJ1PRX96W1V/iUDH/b.c2QcErL.1Vpj0fo8GZtMoQJ/i9shumO', '(000) 000-0000', NULL, 1, 1, 1, '2025-09-21 20:48:24', NULL, '2025-09-10 12:41:21', '2025-09-21 20:48:24'),
(5, 'Laura Natalia', 'Jerez', 'natylau08@gmail.com', '$2a$12$.STAcFDN32Iu/6IqsFBaYe5KDNyHiC6ENfxWr5fujSJpMnfLEl3N2', '03816787411', NULL, 2, 2, 1, '2025-09-18 13:39:37', NULL, '2025-09-18 11:22:08', '2025-09-21 13:54:28');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_pacientes_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_pacientes_completo` (
`id` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`sexo` enum('M','F','O','N')
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
,`obra_social_id` int(11)
,`numero_afiliado` varchar(50)
,`consultorio_id` int(11)
,`usuario_creador_id` int(11)
,`activo` tinyint(1)
,`fecha_creacion` datetime
,`fecha_actualizacion` datetime
,`creador_nombre` varchar(100)
,`consultorio_nombre` varchar(100)
,`obra_social_nombre` varchar(100)
,`obra_social_codigo` varchar(20)
,`ultima_medicion_fecha` datetime
,`ultimo_peso` decimal(5,2)
,`ultimo_imc` decimal(5,2)
,`ultima_grasa` decimal(5,2)
,`total_mediciones` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_suplementos_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_suplementos_completo` (
`id` int(11)
,`nombre` varchar(100)
,`nombre_cientifico` varchar(150)
,`categoria_id` int(11)
,`descripcion_corta` varchar(255)
,`descripcion_detallada` text
,`para_que_sirve` text
,`beneficios_principales` longtext
,`dosis_recomendada` varchar(255)
,`dosis_minima` varchar(100)
,`dosis_maxima` varchar(100)
,`forma_presentacion` enum('cápsula','tableta','polvo','líquido','goma','inyectable','tópico')
,`frecuencia_recomendada` varchar(100)
,`mejor_momento_toma` varchar(100)
,`duracion_tratamiento_tipica` varchar(100)
,`popularidad_uso` int(11)
,`nivel_evidencia` enum('alta','media','baja','experimental')
,`precio_referencial` decimal(8,2)
,`activo` tinyint(4)
,`destacado` tinyint(4)
,`fecha_creacion` datetime
,`fecha_actualizacion` datetime
,`categoria_nombre` varchar(50)
,`categoria_color` varchar(7)
,`categoria_icono` varchar(50)
,`total_indicaciones` bigint(21)
,`total_contraindicaciones` bigint(21)
,`total_interacciones` bigint(21)
,`total_referencias` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_pacientes_completo`
--
DROP TABLE IF EXISTS `v_pacientes_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_pacientes_completo`  AS SELECT `p`.`id` AS `id`, `p`.`nombre` AS `nombre`, `p`.`apellido` AS `apellido`, `p`.`sexo` AS `sexo`, `p`.`fecha_nacimiento` AS `fecha_nacimiento`, `p`.`telefono` AS `telefono`, `p`.`email` AS `email`, `p`.`direccion` AS `direccion`, `p`.`ocupacion` AS `ocupacion`, `p`.`foto_perfil` AS `foto_perfil`, `p`.`altura_inicial` AS `altura_inicial`, `p`.`peso_inicial` AS `peso_inicial`, `p`.`objetivo` AS `objetivo`, `p`.`observaciones_generales` AS `observaciones_generales`, `p`.`obra_social_id` AS `obra_social_id`, `p`.`numero_afiliado` AS `numero_afiliado`, `p`.`consultorio_id` AS `consultorio_id`, `p`.`usuario_creador_id` AS `usuario_creador_id`, `p`.`activo` AS `activo`, `p`.`fecha_creacion` AS `fecha_creacion`, `p`.`fecha_actualizacion` AS `fecha_actualizacion`, `u`.`nombre` AS `creador_nombre`, `c`.`nombre` AS `consultorio_nombre`, `os`.`nombre` AS `obra_social_nombre`, `os`.`codigo` AS `obra_social_codigo`, `m`.`fecha_medicion` AS `ultima_medicion_fecha`, `m`.`peso` AS `ultimo_peso`, `m`.`imc` AS `ultimo_imc`, `m`.`grasa_corporal` AS `ultima_grasa`, count(`med`.`id`) AS `total_mediciones` FROM (((((`pacientes` `p` left join `usuarios` `u` on(`p`.`usuario_creador_id` = `u`.`id`)) left join `consultorios` `c` on(`p`.`consultorio_id` = `c`.`id`)) left join `obras_sociales` `os` on(`p`.`obra_social_id` = `os`.`id`)) left join `mediciones` `m` on(`p`.`id` = `m`.`paciente_id` and `m`.`fecha_medicion` = (select max(`m2`.`fecha_medicion`) from `mediciones` `m2` where `m2`.`paciente_id` = `p`.`id` and `m2`.`activo` = 1))) left join `mediciones` `med` on(`p`.`id` = `med`.`paciente_id` and `med`.`activo` = 1)) WHERE `p`.`activo` = 1 GROUP BY `p`.`id``id`  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_suplementos_completo`
--
DROP TABLE IF EXISTS `v_suplementos_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_suplementos_completo`  AS SELECT `s`.`id` AS `id`, `s`.`nombre` AS `nombre`, `s`.`nombre_cientifico` AS `nombre_cientifico`, `s`.`categoria_id` AS `categoria_id`, `s`.`descripcion_corta` AS `descripcion_corta`, `s`.`descripcion_detallada` AS `descripcion_detallada`, `s`.`para_que_sirve` AS `para_que_sirve`, `s`.`beneficios_principales` AS `beneficios_principales`, `s`.`dosis_recomendada` AS `dosis_recomendada`, `s`.`dosis_minima` AS `dosis_minima`, `s`.`dosis_maxima` AS `dosis_maxima`, `s`.`forma_presentacion` AS `forma_presentacion`, `s`.`frecuencia_recomendada` AS `frecuencia_recomendada`, `s`.`mejor_momento_toma` AS `mejor_momento_toma`, `s`.`duracion_tratamiento_tipica` AS `duracion_tratamiento_tipica`, `s`.`popularidad_uso` AS `popularidad_uso`, `s`.`nivel_evidencia` AS `nivel_evidencia`, `s`.`precio_referencial` AS `precio_referencial`, `s`.`activo` AS `activo`, `s`.`destacado` AS `destacado`, `s`.`fecha_creacion` AS `fecha_creacion`, `s`.`fecha_actualizacion` AS `fecha_actualizacion`, `c`.`nombre` AS `categoria_nombre`, `c`.`color` AS `categoria_color`, `c`.`icono` AS `categoria_icono`, count(distinct `si`.`id`) AS `total_indicaciones`, count(distinct `sc`.`id`) AS `total_contraindicaciones`, count(distinct `sint`.`id`) AS `total_interacciones`, count(distinct `sr`.`id`) AS `total_referencias` FROM (((((`suplementos` `s` left join `categorias_suplementos` `c` on(`s`.`categoria_id` = `c`.`id`)) left join `suplemento_indicaciones` `si` on(`s`.`id` = `si`.`suplemento_id` and `si`.`activo` = 1)) left join `suplemento_contraindicaciones` `sc` on(`s`.`id` = `sc`.`suplemento_id` and `sc`.`activo` = 1)) left join `suplemento_interacciones` `sint` on(`s`.`id` = `sint`.`suplemento_id` and `sint`.`activo` = 1)) left join `suplemento_referencias` `sr` on(`s`.`id` = `sr`.`suplemento_id` and `sr`.`activo` = 1)) WHERE `s`.`activo` = 1 GROUP BY `s`.`id``id`  ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias_suplementos`
--
ALTER TABLE `categorias_suplementos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_categorias_orden` (`orden_visualizacion`,`activo`),
  ADD KEY `idx_categorias_activo` (`activo`,`orden_visualizacion`);

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
-- Indices de la tabla `obras_sociales`
--
ALTER TABLE `obras_sociales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_codigo` (`codigo`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_creador_id` (`usuario_creador_id`),
  ADD KEY `idx_nombre_apellido` (`nombre`,`apellido`),
  ADD KEY `idx_consultorio` (`consultorio_id`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_obra_social` (`obra_social_id`),
  ADD KEY `idx_numero_afiliado` (`numero_afiliado`);

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
-- Indices de la tabla `suplementos`
--
ALTER TABLE `suplementos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria_id`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_destacado` (`destacado`),
  ADD KEY `idx_suplementos_busqueda` (`nombre`,`activo`),
  ADD KEY `idx_suplementos_nombre_destacado` (`nombre`,`destacado`,`activo`),
  ADD KEY `idx_suplementos_popularidad` (`popularidad_uso`,`activo`);
ALTER TABLE `suplementos` ADD FULLTEXT KEY `nombre` (`nombre`,`descripcion_corta`,`para_que_sirve`);

--
-- Indices de la tabla `suplemento_contraindicaciones`
--
ALTER TABLE `suplemento_contraindicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suplemento` (`suplemento_id`),
  ADD KEY `idx_tipo` (`tipo`);

--
-- Indices de la tabla `suplemento_efectos_secundarios`
--
ALTER TABLE `suplemento_efectos_secundarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suplemento` (`suplemento_id`);

--
-- Indices de la tabla `suplemento_indicaciones`
--
ALTER TABLE `suplemento_indicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suplemento` (`suplemento_id`);

--
-- Indices de la tabla `suplemento_interacciones`
--
ALTER TABLE `suplemento_interacciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suplemento` (`suplemento_id`),
  ADD KEY `idx_severidad` (`severidad`);

--
-- Indices de la tabla `suplemento_referencias`
--
ALTER TABLE `suplemento_referencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suplemento` (`suplemento_id`),
  ADD KEY `idx_año` (`año_publicacion`);

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
-- AUTO_INCREMENT de la tabla `categorias_suplementos`
--
ALTER TABLE `categorias_suplementos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `consultorios`
--
ALTER TABLE `consultorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `fotos_pacientes`
--
ALTER TABLE `fotos_pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `mediciones`
--
ALTER TABLE `mediciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `mediciones_versiones`
--
ALTER TABLE `mediciones_versiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `obras_sociales`
--
ALTER TABLE `obras_sociales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `suplementos`
--
ALTER TABLE `suplementos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `suplemento_contraindicaciones`
--
ALTER TABLE `suplemento_contraindicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `suplemento_efectos_secundarios`
--
ALTER TABLE `suplemento_efectos_secundarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `suplemento_indicaciones`
--
ALTER TABLE `suplemento_indicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `suplemento_interacciones`
--
ALTER TABLE `suplemento_interacciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `suplemento_referencias`
--
ALTER TABLE `suplemento_referencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  ADD CONSTRAINT `fk_pacientes_obra_social` FOREIGN KEY (`obra_social_id`) REFERENCES `obras_sociales` (`id`) ON DELETE SET NULL,
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
-- Filtros para la tabla `suplementos`
--
ALTER TABLE `suplementos`
  ADD CONSTRAINT `suplementos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_suplementos` (`id`);

--
-- Filtros para la tabla `suplemento_contraindicaciones`
--
ALTER TABLE `suplemento_contraindicaciones`
  ADD CONSTRAINT `suplemento_contraindicaciones_ibfk_1` FOREIGN KEY (`suplemento_id`) REFERENCES `suplementos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `suplemento_efectos_secundarios`
--
ALTER TABLE `suplemento_efectos_secundarios`
  ADD CONSTRAINT `suplemento_efectos_secundarios_ibfk_1` FOREIGN KEY (`suplemento_id`) REFERENCES `suplementos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `suplemento_indicaciones`
--
ALTER TABLE `suplemento_indicaciones`
  ADD CONSTRAINT `suplemento_indicaciones_ibfk_1` FOREIGN KEY (`suplemento_id`) REFERENCES `suplementos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `suplemento_interacciones`
--
ALTER TABLE `suplemento_interacciones`
  ADD CONSTRAINT `suplemento_interacciones_ibfk_1` FOREIGN KEY (`suplemento_id`) REFERENCES `suplementos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `suplemento_referencias`
--
ALTER TABLE `suplemento_referencias`
  ADD CONSTRAINT `suplemento_referencias_ibfk_1` FOREIGN KEY (`suplemento_id`) REFERENCES `suplementos` (`id`) ON DELETE CASCADE;

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
