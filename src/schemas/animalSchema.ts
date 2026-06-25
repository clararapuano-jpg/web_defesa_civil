import { z } from "zod";

export const animalSchema = z.object({
  especie: z.string(),
  nome: z.string().optional(),
  raca: z.string().optional(),
  porte: z.string().optional(),
  idade_aproximada: z.string().optional(),
  vacinacao_em_dia: z.boolean().optional(),
  precisa_transporte: z.boolean().optional(),
  temperamento: z.string().optional(),
  observacoes: z.string().optional(),
});
