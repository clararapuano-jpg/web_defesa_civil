-- Adiciona coluna de telefone à tabela pessoa
-- Nullable para não quebrar registros existentes
ALTER TABLE pessoa ADD COLUMN IF NOT EXISTS telefone VARCHAR(11);
