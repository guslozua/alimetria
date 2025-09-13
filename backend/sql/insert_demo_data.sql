-- Insertar pacientes de ejemplo para testing

-- Obtener ID del consultorio y usuario admin
SET @consultorio_id = (SELECT id FROM consultorios LIMIT 1);
SET @admin_id = (SELECT id FROM usuarios WHERE email = 'admin@alimetria.com' LIMIT 1);

-- Insertar pacientes de ejemplo
INSERT INTO pacientes (
    nombre, apellido, sexo, fecha_nacimiento, telefono, email, 
    direccion, ocupacion, altura_inicial, peso_inicial, objetivo, 
    consultorio_id, usuario_creador_id
) VALUES 
('Juan', 'Pérez', 'M', '1985-03-15', '(381) 123-4567', 'juan.perez@email.com', 
 'Av. Independencia 123, San Miguel de Tucumán', 'Ingeniero', 175.5, 82.3, 
 'Reducir peso y mejorar condición física', @consultorio_id, @admin_id),

('María', 'González', 'F', '1990-07-22', '(381) 234-5678', 'maria.gonzalez@email.com', 
 'Calle Muñecas 456, Tucumán', 'Profesora', 162.0, 68.5, 
 'Mantener peso saludable y tonificar', @consultorio_id, @admin_id),

('Carlos', 'Rodríguez', 'M', '1978-11-08', '(381) 345-6789', 'carlos.rodriguez@email.com', 
 'Barrio Norte, Tucumán', 'Contador', 180.2, 95.7, 
 'Perder peso por recomendación médica', @consultorio_id, @admin_id),

('Ana', 'Martínez', 'F', '1995-02-14', '(381) 456-7890', 'ana.martinez@email.com', 
 'Villa Mariano Moreno, Tucumán', 'Estudiante', 158.5, 55.2, 
 'Ganar masa muscular', @consultorio_id, @admin_id),

('Roberto', 'Silva', 'M', '1988-09-30', '(381) 567-8901', 'roberto.silva@email.com', 
 'Centro, San Miguel de Tucumán', 'Comerciante', 172.8, 78.4, 
 'Mejorar composición corporal', @consultorio_id, @admin_id);

-- Insertar algunas mediciones de ejemplo
INSERT INTO mediciones (
    paciente_id, tipo, peso, altura, imc, grasa_corporal, musculo, 
    observaciones, fecha_medicion
) VALUES 
-- Mediciones para Juan Pérez
(1, 'manual', 82.3, 175.5, 26.7, 18.5, 35.2, 'Evaluación inicial', NOW() - INTERVAL 30 DAY),
(1, 'manual', 80.1, 175.5, 26.0, 17.8, 35.8, 'Control mensual', NOW() - INTERVAL 7 DAY),

-- Mediciones para María González  
(2, 'manual', 68.5, 162.0, 26.1, 22.3, 28.5, 'Evaluación inicial', NOW() - INTERVAL 25 DAY),
(2, 'manual', 67.2, 162.0, 25.6, 21.8, 29.1, 'Progreso favorable', NOW() - INTERVAL 3 DAY),

-- Mediciones para Carlos Rodríguez
(3, 'manual', 95.7, 180.2, 29.5, 25.8, 40.2, 'IMC elevado - seguimiento nutricional', NOW() - INTERVAL 20 DAY),

-- Mediciones para Ana Martínez
(4, 'manual', 55.2, 158.5, 22.0, 16.2, 26.8, 'Peso bajo - plan de aumento', NOW() - INTERVAL 15 DAY),

-- Mediciones para Roberto Silva
(5, 'manual', 78.4, 172.8, 26.3, 19.5, 34.1, 'Evaluación de rutina', NOW() - INTERVAL 10 DAY);

-- Mensaje de confirmación
SELECT 
    CONCAT('Se insertaron ', COUNT(*), ' pacientes de ejemplo') as mensaje
FROM pacientes 
WHERE usuario_creador_id = @admin_id;
