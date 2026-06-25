import { z }
from "zod";

export const GRAUS_PARENTESCO = [
  "Responsável",
  "Cônjuge/Companheiro(a)",
  "Filho(a)",
  "Enteado(a)",
  "Pai/Mãe",
  "Irmão(ã)",
  "Avô/Avó",
  "Neto(a)",
  "Tio(a)",
  "Sobrinho(a)",
  "Genro/Nora",
  "Sogro(a)",
  "Outro"
] as const;

export const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União Estável",
  "Separado(a)"
] as const;

export const GENEROS = [
  "Masculino",
  "Feminino",
  "Outro"
] as const;

export const CORES_RACAS = [
  "Branca",
  "Preta",
  "Parda",
  "Amarela",
  "Indígena",
  "Prefiro não informar"
] as const;

export const ESCOLARIDADES = [
  "Sem escolaridade",
  "Ensino Fundamental Incompleto",
  "Ensino Fundamental Completo",
  "Ensino Médio Incompleto",
  "Ensino Médio Completo",
  "Ensino Superior Incompleto",
  "Ensino Superior Completo",
  "Pós-graduação"
] as const;

export const SITUACOES_OCUPACIONAIS = [
  "Empregado(a) com carteira",
  "Empregado(a) sem carteira",
  "Autônomo(a)",
  "Desempregado(a)",
  "Aposentado(a) / Pensionista",
  "Estudante",
  "Do lar",
  "Não se aplica"
] as const;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES",
  "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
  "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
] as const;

export const pessoaSchema =
  z.object({

    nome:
      z.string()
        .min(1, "Nome obrigatório"),

    nome_social:
      z.string()
        .optional(),

    telefone:
      z.string()
        .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
        .optional(),

    cpf:
      z.string()
        .length(11, "CPF deve ter 11 dígitos")
        .optional(),

    data_nascimento:
      z.string()
        .optional(),

    rg:
      z.string()
        .optional(),

    uf:
      z.enum(UFS)
        .optional(),

    estado_civil:
      z.enum(ESTADOS_CIVIS)
        .optional(),

    genero:
      z.enum(GENEROS)
        .optional(),

    genero_outro:
      z.string()
        .optional(),

    cor_raca:
      z.enum(CORES_RACAS)
        .optional(),

    escolaridade:
      z.enum(ESCOLARIDADES)
        .optional(),

    profissao:
      z.string()
        .optional(),

    situacao_ocupacional:
      z.enum(SITUACOES_OCUPACIONAIS)
        .optional(),

    nome_mae:
      z.string()
        .optional(),

    nome_pai:
      z.string()
        .optional(),

    local_nascimento:
      z.string()
        .optional(),

    gestante:
      z.boolean()
        .optional(),

    tempo_gestacao_semanas:
      z.number()
        .int("Tempo de gestação deve ser um número inteiro")
        .min(1, "Tempo de gestação deve ser entre 1 e 42 semanas")
        .max(42, "Tempo de gestação deve ser entre 1 e 42 semanas")
        .nullable()
        .optional(),

    grau_parentesco:
      z.enum(GRAUS_PARENTESCO, "Grau de parentesco inválido")
        .optional(),

    grau_parentesco_outro:
      z.string()
        .optional(),

    tipo_responsavel:
      z.enum([
        "Responsavel",
        "Membro"
      ]),

    moradia_id:
      z.string()
        .uuid()
        .optional()

  });

export const pessoaUpdateSchema = pessoaSchema.partial();