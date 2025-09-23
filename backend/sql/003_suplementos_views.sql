-- ==================================================
-- SISTEMA DE SUPLEMENTOS - ALIMETRIA
-- Script 3: Vistas y Datos Detallados
-- ==================================================

-- Vista para consulta completa de suplementos
CREATE VIEW v_suplementos_completo AS
SELECT 
    s.*,
    c.nombre as categoria_nombre,
    c.color as categoria_color,
    c.icono as categoria_icono,
    COUNT(DISTINCT si.id) as total_indicaciones,
    COUNT(DISTINCT sc.id) as total_contraindicaciones,
    COUNT(DISTINCT sint.id) as total_interacciones,
    COUNT(DISTINCT sr.id) as total_referencias
FROM suplementos s
LEFT JOIN categorias_suplementos c ON s.categoria_id = c.id
LEFT JOIN suplemento_indicaciones si ON s.id = si.suplemento_id AND si.activo = 1
LEFT JOIN suplemento_contraindicaciones sc ON s.id = sc.suplemento_id AND sc.activo = 1
LEFT JOIN suplemento_interacciones sint ON s.id = sint.suplemento_id AND sint.activo = 1
LEFT JOIN suplemento_referencias sr ON s.id = sr.suplemento_id AND sr.activo = 1
WHERE s.activo = 1
GROUP BY s.id;

-- DATOS DETALLADOS PARA OMEGA 3 (EJEMPLO COMPLETO)

-- Indicaciones específicas para Omega 3
INSERT INTO suplemento_indicaciones (suplemento_id, indicacion, perfil_paciente, nivel_recomendacion, notas_adicionales) VALUES
(3, 'Hipercolesterolemia', 'Adultos con colesterol LDL >160 mg/dL', 'alta', 'Especialmente efectivo para reducir triglicéridos'),
(3, 'Triglicéridos elevados', 'Pacientes con triglicéridos >200 mg/dL', 'alta', 'Dosis altas (2-4g) pueden ser necesarias'),
(3, 'Prevención cardiovascular primaria', 'Adultos >40 años con factores de riesgo', 'media', 'Combinar con dieta mediterránea'),
(3, 'Artritis reumatoide', 'Pacientes con inflamación crónica articular', 'media', 'Efectos anti-inflamatorios documentados'),
(3, 'Depresión leve-moderada', 'Como terapia complementaria', 'baja', 'Usar junto con tratamiento convencional'),
(3, 'Embarazo y lactancia', 'Mujeres embarazadas y lactantes', 'alta', 'Importante para desarrollo neurológico fetal');

-- Contraindicaciones para Omega 3
INSERT INTO suplemento_contraindicaciones (suplemento_id, tipo, descripcion, poblacion_afectada, severidad) VALUES
(3, 'contraindicacion', 'Alergia conocida al pescado, mariscos o componentes del suplemento', 'Pacientes con alergias alimentarias', 'alta'),
(3, 'precaucion', 'Trastornos hemorrágicos activos o uso de anticoagulantes orales', 'Pacientes con warfarina, heparina, dabigatrán', 'alta'),
(3, 'precaucion', 'Cirugías programadas en las próximas 2 semanas', 'Pacientes pre-quirúrgicos', 'media'),
(3, 'advertencia', 'Puede elevar ligeramente los niveles de glucosa en sangre', 'Diabéticos tipo 2', 'baja'),
(3, 'precaucion', 'Interacción con medicamentos hipotensores', 'Pacientes hipertensos medicados', 'media');

-- Interacciones para Omega 3
INSERT INTO suplemento_interacciones (suplemento_id, tipo_interaccion, nombre_interaccion, descripcion_interaccion, severidad, recomendacion) VALUES
(3, 'medicamento', 'Warfarina', 'Puede aumentar el efecto anticoagulante y riesgo de sangrado', 'grave', 'Monitorear INR frecuentemente, ajustar dosis si necesario'),
(3, 'medicamento', 'Aspirina', 'Efecto aditivo antitrombótico, mayor riesgo de sangrado', 'moderada', 'Vigilar signos de sangrado, considerar dosis menores'),
(3, 'medicamento', 'Antihipertensivos', 'Puede potenciar el efecto hipotensor', 'leve', 'Monitorizar presión arterial regularmente'),
(3, 'medicamento', 'Estatinas', 'Efecto sinérgico en reducción de lípidos', 'leve', 'Combinación beneficiosa, monitorear perfil lipídico'),
(3, 'suplemento', 'Vitamina E', 'Efecto antioxidante sinérgico, previene oxidación del omega 3', 'leve', 'Combinación recomendada'),
(3, 'alimento', 'Alcohol (exceso)', 'Puede reducir la absorción y aumentar oxidación', 'leve', 'Moderar consumo de alcohol, separar tomas');

-- Efectos secundarios para Omega 3
INSERT INTO suplemento_efectos_secundarios (suplemento_id, efecto_secundario, frecuencia, descripcion, manejo_recomendado) VALUES
(3, 'Eructos con sabor a pescado', 'muy_común', 'Sabor desagradable post-ingesta', 'Tomar con comidas, refrigerar el producto, elegir forma entérica'),
(3, 'Náuseas leves', 'común', 'Malestar estomacal especialmente en ayunas', 'Tomar siempre con alimentos'),
(3, 'Diarrea leve', 'común', 'Heces blandas, especialmente con dosis altas', 'Reducir dosis temporalmente, aumentar gradualmente'),
(3, 'Dolor abdominal', 'poco_común', 'Molestias digestivas', 'Tomar con comidas abundantes'),
(3, 'Mal aliento', 'poco_común', 'Halitosis transitoria', 'Mejorar higiene oral, tomar con comidas'),
(3, 'Sangrado prolongado', 'raro', 'Tiempo de coagulación aumentado', 'Suspender y consultar médico inmediatamente');

-- Referencias científicas para Omega 3
INSERT INTO suplemento_referencias (suplemento_id, titulo_estudio, autores, revista_publicacion, año_publicacion, tipo_estudio, resumen_hallazgos, calidad_evidencia, url_referencia) VALUES
(3, 'Cardiovascular effects of marine omega-3 fatty acids', 'Mozaffarian D, Wu JH', 'New England Journal of Medicine', 2019, 'revision_sistematica', 'Reducción significativa de eventos cardiovasculares mayores con EPA/DHA >1g/día', 'alta', 'https://www.nejm.org/'),
(3, 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease', 'Abdelhamid AS, et al.', 'Cochrane Database', 2020, 'meta_analisis', 'Evidencia moderada de beneficio en prevención secundaria cardiovascular', 'alta', 'https://www.cochrane.org/'),
(3, 'Marine n-3 polyunsaturated fatty acids and coronary heart disease', 'Harris WS, et al.', 'Atherosclerosis', 2021, 'ensayo_clinico', 'EPA de alta dosis reduce eventos cardiovasculares en 25%', 'alta', ''),
(3, 'Omega-3 supplementation and depression: systematic review', 'Freeman MP, et al.', 'JAMA Psychiatry', 2020, 'revision_sistematica', 'Efecto modesto pero significativo en depresión mayor', 'moderada', '');

-- DATOS BÁSICOS PARA VITAMINA D3

-- Indicaciones para Vitamina D3
INSERT INTO suplemento_indicaciones (suplemento_id, indicacion, perfil_paciente, nivel_recomendacion, notas_adicionales) VALUES
(2, 'Deficiencia de vitamina D', 'Población general con niveles <20 ng/mL', 'alta', 'Muy común en países con poca exposición solar'),
(2, 'Osteoporosis', 'Mujeres postmenopáusicas y hombres >70 años', 'alta', 'Esencial junto con calcio'),
(2, 'Apoyo inmunológico', 'Personas con infecciones respiratorias frecuentes', 'media', 'Especialmente en otoño/invierno'),
(2, 'Síndrome metabólico', 'Pacientes con diabetes tipo 2 y obesidad', 'media', 'Mejora sensibilidad a insulina');

-- Contraindicaciones para Vitamina D3
INSERT INTO suplemento_contraindicaciones (suplemento_id, tipo, descripcion, poblacion_afectada, severidad) VALUES
(2, 'contraindicacion', 'Hipercalcemia o niveles muy altos de vitamina D', 'Pacientes con vitamina D >80 ng/mL', 'alta'),
(2, 'precaucion', 'Cálculos renales de calcio recurrentes', 'Pacientes con nefrolitiasis', 'media'),
(2, 'precaucion', 'Sarcoidosis u otras enfermedades granulomatosas', 'Pacientes con trastornos del metabolismo del calcio', 'media'),
(2, 'advertencia', 'Interacción con diuréticos tiazídicos', 'Pacientes hipertensos con ciertos medicamentos', 'baja');

-- DATOS BÁSICOS PARA MULTIVITAMÍNICOS

-- Indicaciones para Multivitamínicos
INSERT INTO suplemento_indicaciones (suplemento_id, indicacion, perfil_paciente, nivel_recomendacion, notas_adicionales) VALUES
(1, 'Dietas restrictivas o desequilibradas', 'Personas con alimentación limitada', 'alta', 'Especialmente útil en dietas veganas o muy restrictivas'),
(1, 'Adultos mayores', 'Personas >65 años con pérdida de apetito', 'alta', 'Absorción reducida con la edad'),
(1, 'Embarazo y lactancia', 'Mujeres gestantes y lactantes', 'media', 'Complementar ácido fólico específico'),
(1, 'Recuperación post-enfermedad', 'Pacientes en convalecencia', 'media', 'Apoyo nutricional temporal');

-- Contraindicaciones para Multivitamínicos
INSERT INTO suplemento_contraindicaciones (suplemento_id, tipo, descripcion, poblacion_afectada, severidad) VALUES
(1, 'precaucion', 'Exceso de vitaminas liposolubles (A, D, E, K)', 'Personas que ya toman suplementos individuales', 'media'),
(1, 'precaucion', 'Hemochromatosis o sobrecarga de hierro', 'Pacientes con trastornos del metabolismo del hierro', 'alta'),
(1, 'advertencia', 'No reemplaza una dieta equilibrada', 'Población general', 'baja');

-- DATOS PARA CREATINA

-- Indicaciones para Creatina
INSERT INTO suplemento_indicaciones (suplemento_id, indicacion, perfil_paciente, nivel_recomendacion, notas_adicionales) VALUES
(9, 'Entrenamiento de fuerza y potencia', 'Deportistas de disciplinas anaeróbicas', 'alta', 'Uno de los suplementos más estudiados'),
(9, 'Sarcopenia', 'Adultos mayores con pérdida de masa muscular', 'media', 'Combinar con ejercicio de resistencia'),
(9, 'Deportes explosivos', 'Atletas de sprint, levantamiento de pesas', 'alta', 'Máxima efectividad en ejercicios <30 segundos'),
(9, 'Recuperación muscular', 'Deportistas en entrenamientos intensos', 'media', 'Reduce daño muscular y acelera recuperación');

-- Contraindicaciones para Creatina
INSERT INTO suplemento_contraindicaciones (suplemento_id, tipo, descripcion, poblacion_afectada, severidad) VALUES
(9, 'precaucion', 'Enfermedad renal preexistente', 'Pacientes con insuficiencia renal', 'alta'),
(9, 'precaucion', 'Deshidratación o ingesta insuficiente de agua', 'Deportistas en climas calurosos', 'media'),
(9, 'advertencia', 'Puede causar retención de agua inicial', 'Deportistas de deportes con categorías de peso', 'baja');

-- Interacciones para Creatina
INSERT INTO suplemento_interacciones (suplemento_id, tipo_interaccion, nombre_interaccion, descripcion_interaccion, severidad, recomendacion) VALUES
(9, 'medicamento', 'Diuréticos', 'Puede aumentar riesgo de deshidratación', 'moderada', 'Aumentar ingesta de agua significativamente'),
(9, 'suplemento', 'Cafeína (altas dosis)', 'Puede reducir efectividad de la creatina', 'leve', 'Separar tomas o moderar cafeína'),
(9, 'alimento', 'Carbohidratos simples', 'Mejora la captación muscular de creatina', 'leve', 'Tomar con jugo o dextrosa para mejor absorción');

-- CONFIGURACIÓN FINAL

-- Actualizar popularidad basada en evidencia y uso común
UPDATE suplementos SET popularidad_uso = 95 WHERE nombre = 'Omega 3 (EPA/DHA)';
UPDATE suplementos SET popularidad_uso = 88 WHERE nombre = 'Vitamina D3';
UPDATE suplementos SET popularidad_uso = 82 WHERE nombre = 'Multivitamínicos';
UPDATE suplementos SET popularidad_uso = 91 WHERE nombre = 'Creatina';
UPDATE suplementos SET popularidad_uso = 75 WHERE nombre = 'Proteína en Polvo';
UPDATE suplementos SET popularidad_uso = 78 WHERE nombre = 'Probióticos';
UPDATE suplementos SET popularidad_uso = 65 WHERE nombre = 'Hierro';
UPDATE suplementos SET popularidad_uso = 58 WHERE nombre = 'Calcio';
UPDATE suplementos SET popularidad_uso = 45 WHERE nombre = 'Colágeno Hidrolizado';
UPDATE suplementos SET popularidad_uso = 42 WHERE nombre = 'BCAA (Aminoácidos Ramificados)';

-- Crear índices adicionales para optimización de búsquedas
CREATE INDEX idx_suplementos_nombre_destacado ON suplementos(nombre, destacado, activo);
CREATE INDEX idx_suplementos_popularidad ON suplementos(popularidad_uso DESC, activo);
CREATE INDEX idx_categorias_activo ON categorias_suplementos(activo, orden_visualizacion);

-- Verificación de integridad
SELECT 
    'Categorías creadas' as tabla, 
    COUNT(*) as total 
FROM categorias_suplementos 
WHERE activo = 1
UNION ALL
SELECT 
    'Suplementos creados' as tabla, 
    COUNT(*) as total 
FROM suplementos 
WHERE activo = 1
UNION ALL
SELECT 
    'Indicaciones creadas' as tabla, 
    COUNT(*) as total 
FROM suplemento_indicaciones 
WHERE activo = 1
UNION ALL
SELECT 
    'Contraindicaciones creadas' as tabla, 
    COUNT(*) as total 
FROM suplemento_contraindicaciones 
WHERE activo = 1;
