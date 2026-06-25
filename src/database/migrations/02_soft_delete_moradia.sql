-- Adiciona a coluna para exclusão lógica
ALTER TABLE moradia ADD COLUMN "deletedAt" TIMESTAMP DEFAULT NULL;
