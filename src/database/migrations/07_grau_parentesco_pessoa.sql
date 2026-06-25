-- Adiciona o grau de parentesco do membro em relação ao responsável pela família
-- Nullable para não quebrar registros existentes; obrigatoriedade validada na camada de aplicação
ALTER TABLE pessoa ADD COLUMN IF NOT EXISTS grau_parentesco VARCHAR(50);
ALTER TABLE pessoa ADD COLUMN IF NOT EXISTS grau_parentesco_outro VARCHAR(255);
