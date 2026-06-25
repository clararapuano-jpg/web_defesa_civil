-- Adiciona o grau de risco da moradia e os tipos de risco associados
-- grau_de_risco: nome alinhado com a coluna já criada manualmente no Supabase
-- riscos_moradia segue o padrão de sinais_alerta: texto único com valores separados por vírgula
ALTER TABLE moradia ADD COLUMN IF NOT EXISTS grau_de_risco VARCHAR(50);
ALTER TABLE moradia ADD COLUMN IF NOT EXISTS riscos_moradia TEXT;
