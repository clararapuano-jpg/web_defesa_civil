import { z }
from "zod";

export const GRAUS_RISCO = [
  "Setor de Monitoramento",
  "Risco Alto",
  "Risco Muito Alto"
] as const;

export const TIPOS_CONSTRUCAO = [
  "Alvenaria",
  "Madeira",
  "Mista (alvenaria e madeira)",
  "Taipa / Adobe",
  "Lona / Papelão",
  "Metálica",
  "Outro"
] as const;

export const TEMPOS_RESIDENCIA = [
  "Menos de 1 ano",
  "1 a 5 anos",
  "5 a 10 anos",
  "10 a 20 anos",
  "Mais de 20 anos"
] as const;

export const USOS_IMOVEL = [
  "Residencial",
  "Comercial",
  "Misto"
] as const;

export const CONDICOES_OCUPACAO = [
  "Próprio quitado",
  "Próprio financiado",
  "Alugado",
  "Cedido / Emprestado",
  "Ocupação irregular",
  "Outro"
] as const;

export const NUMEROS_PAVIMENTOS = [
  "1",
  "2",
  "3",
  "Mais de 3"
] as const;

export const moradiaSchema =
  z.object({

    pessoa_id:
      z.string().uuid(),

    endereco:
      z.string().min(1, "Endereço é obrigatório"),

    numero:
      z.string()
        .optional(),

    bairro:
      z.string()
        .optional(),

    cidade:
      z.string()
        .optional(),

    cep:
      z.string()
        .optional(),

    complemento:
      z.string()
        .optional(),

    tipo_construcao:
      z.enum(TIPOS_CONSTRUCAO)
        .optional(),

    tempo_residencia:
      z.enum(TEMPOS_RESIDENCIA)
        .optional(),

    historico:
      z.string()
        .optional(),

    uso_imovel:
      z.enum(USOS_IMOVEL)
        .optional(),

    condicao:
      z.enum(CONDICOES_OCUPACAO)
        .optional(),

    numero_pavimentos:
      z.enum(NUMEROS_PAVIMENTOS)
        .optional(),

    sinais_alerta:
      z.string()
        .optional(),

    grau_de_risco:
      z.enum(GRAUS_RISCO, "Grau de risco inválido")
        .optional(),

    riscos_moradia:
      z.string()
        .optional(),

    numero_ficha:
      z.string()
        .optional(),

    latitude:
      z.number()
        .optional(),

    longitude:
      z.number()
        .optional(),

  });

// RN04/RN05: rejeita coordenadas zeradas (GPS não capturado) e fora do território brasileiro
const coordenadaLat = z.number()
  .refine((v: number) => v !== 0, { message: "Latitude zerada indica coordenada não capturada (RN04/RN05)" })
  .refine((v: number) => v >= -33.75 && v <= 5.28, { message: "Latitude fora do território brasileiro" })
  .optional();

const coordenadaLon = z.number()
  .refine((v: number) => v !== 0, { message: "Longitude zerada indica coordenada não capturada (RN04/RN05)" })
  .refine((v: number) => v >= -73.99 && v <= -28.84, { message: "Longitude fora do território brasileiro" })
  .optional();

export const moradiaUpdateSchema = z.object({
  endereco:          z.string().min(1).optional(),
  numero:            z.string().optional(),
  bairro:            z.string().optional(),
  cidade:            z.string().optional(),
  cep:               z.string().optional(),
  complemento:       z.string().optional(),
  tipo_construcao:   z.enum(TIPOS_CONSTRUCAO).optional(),
  tempo_residencia:  z.enum(TEMPOS_RESIDENCIA).optional(),
  historico:         z.string().optional(),
  uso_imovel:        z.enum(USOS_IMOVEL).optional(),
  condicao:          z.enum(CONDICOES_OCUPACAO).optional(),
  numero_pavimentos: z.enum(NUMEROS_PAVIMENTOS).optional(),
  sinais_alerta:     z.string().optional(),
  grau_de_risco:     z.enum(GRAUS_RISCO, "Grau de risco inválido").optional(),
  riscos_moradia:    z.string().optional(),
  numero_ficha:      z.string().optional(),
  latitude:          coordenadaLat,
  longitude:         coordenadaLon,
});