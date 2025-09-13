    'citas', JSON_ARRAY('crear', 'leer', 'actualizar')
)),
('secretario', 'Personal administrativo', JSON_OBJECT(
    'pacientes', JSON_ARRAY('crear', 'leer'),
    'citas', JSON_ARRAY('crear', 'leer', 'actualizar'),
    'reportes', JSON_ARRAY('leer')
)),
('paciente', 'Paciente del consultorio', JSON_OBJECT(
    'perfil_propio', JSON_ARRAY('leer'),
    'mediciones_propias', JSON_ARRAY('leer'),
    'citas_propias', JSON_ARRAY('leer')
));

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
-- TRIGGERS PARA AUDITORÍA
-- =========================================

-- Trigger para crear versión cuando se actualiza una medición
DELIMITER //
CREATE TRIGGER tr_mediciones_version_update
    BEFORE UPDATE ON mediciones
    FOR EACH ROW
BEGIN
    IF OLD.version IS NOT NULL THEN
        INSERT INTO mediciones_versiones (medicion_id, version_anterior, datos_anteriores, fecha_modificacion)
        VALUES (OLD.id, OLD.version, JSON_OBJECT(
            'peso', OLD.peso,
            'altura', OLD.altura,
            'imc', OLD.imc,
            'grasa_corporal', OLD.grasa_corporal,
            'musculo', OLD.musculo,
            'observaciones', OLD.observaciones
        ), NOW());
        
        SET NEW.version = OLD.version + 1;
    END IF;
END//
DELIMITER ;

-- =========================================
-- VISTAS ÚTILES
-- =========================================

-- Vista para obtener información completa de pacientes con su última medición
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

-- Vista para estadísticas de citas por nutricionista
CREATE VIEW v_estadisticas_citas AS
SELECT 
    u.id as nutricionista_id,
    CONCAT(u.nombre, ' ', u.apellido) as nutricionista_nombre,
    COUNT(c.id) as total_citas,
    SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas,
    SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
    SUM(CASE WHEN c.estado = 'no_asistio' THEN 1 ELSE 0 END) as no_asistencias,
    ROUND(SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 2) as porcentaje_completadas
FROM usuarios u
LEFT JOIN citas c ON u.id = c.nutricionista_id
WHERE u.activo = TRUE
GROUP BY u.id;

-- =========================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =========================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_mediciones_paciente_fecha_tipo ON mediciones(paciente_id, fecha_medicion DESC, tipo);
CREATE INDEX idx_citas_nutricionista_estado_fecha ON citas(nutricionista_id, estado, fecha_hora);
CREATE INDEX idx_notificaciones_usuario_tipo_leida ON notificaciones(destinatario_id, tipo, leida);

-- =========================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =========================================

-- Procedimiento para obtener evolución de un paciente
DELIMITER //
CREATE PROCEDURE sp_evolucion_paciente(
    IN p_paciente_id INT,
    IN p_fecha_desde DATE,
    IN p_fecha_hasta DATE
)
BEGIN
    SELECT 
        DATE(fecha_medicion) as fecha,
        peso,
        imc,
        grasa_corporal,
        musculo,
        grasa_corporal_kg,
        agua_corporal_porcentaje
    FROM mediciones 
    WHERE paciente_id = p_paciente_id 
        AND activo = TRUE
        AND DATE(fecha_medicion) BETWEEN IFNULL(p_fecha_desde, '1900-01-01') AND IFNULL(p_fecha_hasta, CURDATE())
    ORDER BY fecha_medicion ASC;
END//
DELIMITER ;

-- Procedimiento para estadísticas del consultorio
DELIMITER //
CREATE PROCEDURE sp_estadisticas_consultorio(
    IN p_consultorio_id INT
)
BEGIN
    SELECT 
        'pacientes_activos' as metrica,
        COUNT(*) as valor
    FROM pacientes 
    WHERE activo = TRUE AND (p_consultorio_id IS NULL OR consultorio_id = p_consultorio_id)
    
    UNION ALL
    
    SELECT 
        'mediciones_este_mes' as metrica,
        COUNT(*) as valor
    FROM mediciones m
    JOIN pacientes p ON m.paciente_id = p.id
    WHERE m.activo = TRUE 
        AND MONTH(m.fecha_medicion) = MONTH(CURDATE())
        AND YEAR(m.fecha_medicion) = YEAR(CURDATE())
        AND (p_consultorio_id IS NULL OR p.consultorio_id = p_consultorio_id)
    
    UNION ALL
    
    SELECT 
        'citas_pendientes' as metrica,
        COUNT(*) as valor
    FROM citas c
    WHERE c.estado IN ('programada', 'confirmada')
        AND c.fecha_hora >= NOW()
        AND (p_consultorio_id IS NULL OR c.consultorio_id = p_consultorio_id);
END//
DELIMITER ;

-- =========================================
-- COMENTARIOS FINALES
-- =========================================
/*
Este script crea una base de datos completa para el sistema Alimetria.

Características principales:
- Soporte multi-consultorio
- Control de versiones en mediciones
- Sistema completo de roles y permisos
- Auditoría y trazabilidad
- Optimizado para performance
- Notificaciones y alertas
- Configuraciones flexibles

Para usar:
1. Ejecutar este script en MySQL
2. Configurar las variables de entorno en .env
3. El sistema creará automáticamente los datos iniciales

Versión: 1.0.0
Fecha: Septiembre 2025
Autor: Gus - Proyecto Alimetria
*/
