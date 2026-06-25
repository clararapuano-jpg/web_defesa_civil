-- Adiciona coluna para armazenar gênero livre quando o usuário seleciona "Outro"
ALTER TABLE pessoa ADD COLUMN IF NOT EXISTS genero_outro VARCHAR(255);
