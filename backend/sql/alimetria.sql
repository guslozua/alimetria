-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-09-2025 a las 15:12:10
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

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `paciente_id`, `nutricionista_id`, `fecha_hora`, `duracion_minutos`, `tipo_consulta`, `estado`, `motivo`, `notas_previas`, `notas_posteriores`, `recordatorio_enviado`, `fecha_recordatorio`, `consultorio_id`, `usuario_creador_id`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 4, 1, '2025-09-12 10:00:00', 60, 'seguimiento', 'no_asistio', 'Control mensual', 'Paciente refiere mejora en hábitos alimentarios', 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 22:19:07', '2025-09-14 22:04:12'),
(2, 3, 1, '2025-09-13 17:30:00', 45, 'primera_vez', 'no_asistio', 'Evaluación inicial', NULL, 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 22:19:08', '2025-09-14 22:04:12'),
(3, 4, 1, '2025-09-14 09:00:35', 60, 'seguimiento', 'completada', 'Control mensual', 'Paciente refiere mejora en hábitos alimentarios\nCita completada exitosamente.', 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 23:04:04', '2025-09-15 14:26:16'),
(4, 3, 1, '2025-09-13 14:30:00', 45, 'primera_vez', 'no_asistio', 'Evaluación inicial', NULL, 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-11 23:04:04', '2025-09-14 22:04:12'),
(5, 1, 1, '2025-09-16 18:00:00', 60, 'seguimiento', 'confirmada', 'nada', '', NULL, 0, NULL, 1, 1, '2025-09-13 22:56:26', '2025-09-15 12:39:00'),
(6, 5, 1, '2025-09-15 21:00:00', 60, 'control', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-13 23:18:02', '2025-09-16 17:40:10'),
(7, 6, 1, '2025-09-17 02:00:00', 60, 'seguimiento', 'programada', '', '', NULL, 0, NULL, 1, 1, '2025-09-14 00:11:10', '2025-09-14 23:34:40'),
(8, 2, 1, '2025-09-16 00:00:00', 60, 'seguimiento', 'no_asistio', 'prueba horario', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 00:24:56', '2025-09-16 17:40:10'),
(9, 1, 1, '2025-09-19 16:00:00', 60, 'control', 'cancelada', 'prueba horario', '', NULL, 0, NULL, 1, 1, '2025-09-14 01:15:27', '2025-09-16 17:41:45'),
(10, 1, 1, '2025-09-16 23:00:00', 60, 'control', 'confirmada', '', '', NULL, 0, NULL, 1, 1, '2025-09-14 13:07:44', '2025-09-15 10:07:37'),
(11, 1, 1, '2025-09-16 09:00:00', 60, 'seguimiento', 'no_asistio', '', '', 'Actualizado automáticamente - paciente no asistió (2h de gracia aplicadas)', 0, NULL, 1, 1, '2025-09-14 13:39:08', '2025-09-16 17:40:10'),
(12, 2, 1, '2025-09-17 12:00:00', 45, 'primera_vez', 'programada', '', '', NULL, 0, NULL, 1, 1, '2025-09-14 13:47:42', '2025-09-14 13:47:42'),
(13, 6, 1, '2025-09-14 22:00:00', 30, 'urgencia', 'completada', '', '', 'Actualizado automáticamente - paciente no asistió', 0, NULL, 1, 1, '2025-09-14 20:56:16', '2025-09-15 14:25:56'),
(14, 6, 1, '2025-09-17 04:00:00', 60, 'seguimiento', 'confirmada', '', '', NULL, 0, NULL, 1, 1, '2025-09-14 22:38:53', '2025-09-16 17:40:26'),
(15, 6, 1, '2025-09-20 19:00:00', 60, 'seguimiento', 'programada', '', '', NULL, 0, NULL, 1, 1, '2025-09-14 22:53:48', '2025-09-14 22:53:48'),
(16, 6, 1, '2025-09-30 14:00:00', 30, 'urgencia', 'confirmada', 'pruena de horario ', '', NULL, 0, NULL, 1, 1, '2025-09-15 11:38:10', '2025-09-15 11:38:42');

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
(7, 'mostrar_demo', 'true', 'boolean', 'Mostrar datos de demostración', 'general', 1, '2025-09-10 12:35:00'),
(8, 'email_habilitado', 'true', 'boolean', 'Habilitar/deshabilitar el envío de emails del sistema', 'notificaciones', 0, '2025-09-18 10:09:08'),
(9, 'email_host', 'smtp.gmail.com', 'string', 'Servidor SMTP para envío de emails', 'notificaciones', 0, '2025-09-18 10:09:08'),
(10, 'email_puerto', '587', 'number', 'Puerto del servidor SMTP', 'notificaciones', 0, '2025-09-18 10:09:08'),
(11, 'email_usuario', '', 'string', 'Usuario/email para autenticación SMTP', 'notificaciones', 0, '2025-09-18 10:09:08'),
(12, 'email_password', '', 'string', 'Contraseña para autenticación SMTP', 'notificaciones', 0, '2025-09-18 10:09:08'),
(13, 'email_seguridad', 'TLS', 'string', 'Tipo de seguridad SMTP (TLS/SSL/NONE)', 'notificaciones', 0, '2025-09-18 10:09:08'),
(14, 'email_remitente_nombre', 'Alimetria - Sistema de Nutrición', 'string', 'Nombre que aparece como remitente', 'notificaciones', 0, '2025-09-18 10:09:08'),
(15, 'email_remitente_direccion', 'noreply@alimetria.com', 'string', 'Dirección email del remitente', 'notificaciones', 0, '2025-09-18 10:09:08'),
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
(1, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el lunes, 15 de septiembre de 2025, 17:00.', 1, 2, 8, 0, 1, '2025-09-14 17:00:00', '2025-09-14 23:35:05', NULL, 1),
(2, 'sistema', 'Sistema de notificaciones activo', 'El sistema de notificaciones de Alimetria está funcionando correctamente. Esta es una notificación de prueba.', 1, NULL, NULL, 1, 1, '2025-09-14 00:55:30', '2025-09-14 23:35:03', '2025-09-16 00:21:27', 1),
(3, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el viernes, 19 de septiembre de 2025, 16:00.', 1, 1, 9, 0, 0, '2025-09-18 16:00:00', NULL, NULL, 1),
(4, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el lunes, 15 de septiembre de 2025, 17:00.', 1, 1, 10, 1, 1, '2025-09-14 17:00:00', '2025-09-14 23:35:08', '2025-09-16 00:21:44', 1),
(5, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el miércoles, 17 de septiembre de 2025, 12:00.', 1, 2, 12, 0, 0, '2025-09-16 12:00:00', NULL, NULL, 0),
(6, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el miércoles, 17 de septiembre de 2025, 15:00.', 1, 6, 14, 0, 1, '2025-09-16 15:00:00', '2025-09-16 15:00:03', NULL, 1),
(7, 'cita_recordatorio', 'Recordatorio de Cita', 'Tienes una cita programada para el sábado, 20 de septiembre de 2025, 19:00.', 1, 6, 15, 0, 0, '2025-09-19 19:00:00', NULL, NULL, 1);

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
(6, 'Sergio', 'Lozua', 'M', '1977-07-27', '03816503889', 'sdgsdg@sgsdg.com', 'Avenida silvano Bores 297', 'va', NULL, '180.00', '105.00', NULL, NULL, 3, '1234567833', NULL, 1, 1, '2025-09-11 09:58:30', '2025-09-15 23:12:57');

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
(1, 'Administrador', 'Sistema', 'sglozua@gmail.com', '$2a$12$Re3dJ1PRX96W1V/iUDH/b.c2QcErL.1Vpj0fo8GZtMoQJ/i9shumO', '(000) 000-0000', NULL, 1, 1, 1, '2025-09-15 13:07:55', NULL, '2025-09-10 12:41:21', '2025-09-15 13:07:55'),
(4, 'Laura Natalia', 'Jerez', 'natylau08@gmail.com', '$2a$12$iWpm.2PCHdAQRxLuYrgJGesBUIyzirllLTjtYoB6r9Q7D05QfgCVu', '0303456', NULL, 2, 1, 1, NULL, NULL, '2025-09-16 20:32:06', '2025-09-17 17:27:27');

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
-- Estructura para la vista `v_pacientes_completo`
--
DROP TABLE IF EXISTS `v_pacientes_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_pacientes_completo`  AS SELECT `p`.`id` AS `id`, `p`.`nombre` AS `nombre`, `p`.`apellido` AS `apellido`, `p`.`sexo` AS `sexo`, `p`.`fecha_nacimiento` AS `fecha_nacimiento`, `p`.`telefono` AS `telefono`, `p`.`email` AS `email`, `p`.`direccion` AS `direccion`, `p`.`ocupacion` AS `ocupacion`, `p`.`foto_perfil` AS `foto_perfil`, `p`.`altura_inicial` AS `altura_inicial`, `p`.`peso_inicial` AS `peso_inicial`, `p`.`objetivo` AS `objetivo`, `p`.`observaciones_generales` AS `observaciones_generales`, `p`.`obra_social_id` AS `obra_social_id`, `p`.`numero_afiliado` AS `numero_afiliado`, `p`.`consultorio_id` AS `consultorio_id`, `p`.`usuario_creador_id` AS `usuario_creador_id`, `p`.`activo` AS `activo`, `p`.`fecha_creacion` AS `fecha_creacion`, `p`.`fecha_actualizacion` AS `fecha_actualizacion`, `u`.`nombre` AS `creador_nombre`, `c`.`nombre` AS `consultorio_nombre`, `os`.`nombre` AS `obra_social_nombre`, `os`.`codigo` AS `obra_social_codigo`, `m`.`fecha_medicion` AS `ultima_medicion_fecha`, `m`.`peso` AS `ultimo_peso`, `m`.`imc` AS `ultimo_imc`, `m`.`grasa_corporal` AS `ultima_grasa`, count(`med`.`id`) AS `total_mediciones` FROM (((((`pacientes` `p` left join `usuarios` `u` on(`p`.`usuario_creador_id` = `u`.`id`)) left join `consultorios` `c` on(`p`.`consultorio_id` = `c`.`id`)) left join `obras_sociales` `os` on(`p`.`obra_social_id` = `os`.`id`)) left join `mediciones` `m` on(`p`.`id` = `m`.`paciente_id` and `m`.`fecha_medicion` = (select max(`m2`.`fecha_medicion`) from `mediciones` `m2` where `m2`.`paciente_id` = `p`.`id` and `m2`.`activo` = 1))) left join `mediciones` `med` on(`p`.`id` = `med`.`paciente_id` and `med`.`activo` = 1)) WHERE `p`.`activo` = 1 GROUP BY `p`.`id``id`  ;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
