-- Create animal table for 1:N relationship with moradia
CREATE TABLE IF NOT EXISTS animal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moradia_id UUID NOT NULL REFERENCES moradia(id) ON DELETE CASCADE,
  especie TEXT NOT NULL,
  nome TEXT,
  raca TEXT,
  porte TEXT,
  idade_aproximada TEXT,
  vacinacao_em_dia BOOLEAN DEFAULT FALSE,
  precisa_transporte BOOLEAN DEFAULT FALSE,
  temperamento TEXT,
  observacoes TEXT,
  foto_arquivo TEXT,
  foto_nome_original TEXT,
  foto_tipo_arquivo TEXT,
  foto_tamanho INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on moradia_id for faster queries
CREATE INDEX IF NOT EXISTS idx_animal_moradia_id ON animal(moradia_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_animal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_animal_updated_at
BEFORE UPDATE ON animal
FOR EACH ROW
EXECUTE FUNCTION update_animal_updated_at();
