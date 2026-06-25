import { z }
from "zod";

export const imagemSchema =
  z.object({

    moradia_id:
      z.string().uuid(),

    arquivo:
      z.any(),

    nome_original:
      z.string()
        .optional(),

    tipo_arquivo:
      z.string()
        .optional(),

    tamanho:
      z.number()
        .optional()

  });