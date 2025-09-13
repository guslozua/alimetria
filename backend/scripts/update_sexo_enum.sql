-- Script para actualizar las opciones de sexo/género
-- Ejecutar en MySQL para modificar la tabla pacientes

USE alimetria;

-- Modificar el ENUM para incluir más opciones
ALTER TABLE pacientes 
MODIFY COLUMN sexo ENUM('M','F','O','N') NOT NULL 
COMMENT 'M=Masculino, F=Femenino, O=Otro/No binario, N=Prefiero no especificar';

-- Verificar el cambio
DESCRIBE pacientes;
