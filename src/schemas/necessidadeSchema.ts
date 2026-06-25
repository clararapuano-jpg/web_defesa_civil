import { z }
from "zod";

export const necessidadeSchema =
  z.object({

    pessoa_id:
      z.string().uuid(),

    idosos:
      z.boolean()
        .optional(),

    criancas:
      z.boolean()
        .optional(),

    gestantes_lactantes:
      z.boolean()
        .optional(),

    mobilidade_reduzida:
      z.boolean()
        .optional(),

    doencas_cronicas:
      z.boolean()
        .optional(),

    medicamentos_continuos:
      z.boolean()
        .optional(),

    tipo_necessidade:
      z.string().optional()

  });