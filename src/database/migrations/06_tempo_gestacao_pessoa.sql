-- Adiciona coluna de tempo de gestação (em semanas) à tabela pessoa
-- Nullable pois só se aplica a pessoas gestantes
ALTER TABLE pessoa ADD COLUMN IF NOT EXISTS tempo_gestacao_semanas INTEGER NULL;
