-- Adiciona o vínculo com a moradia na tabela pessoa
ALTER TABLE pessoa ADD COLUMN moradia_id UUID;

-- Garante a integridade referencial aplicando ON DELETE CASCADE
ALTER TABLE pessoa ADD CONSTRAINT fk_pessoa_moradia FOREIGN KEY (moradia_id) REFERENCES moradia(id) ON DELETE CASCADE;

-- Remove qualquer dependência da tabela legada ou da coluna antiga
ALTER TABLE pessoa DROP COLUMN responsavel_id;
