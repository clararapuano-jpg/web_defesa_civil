import { z }
from "zod";

export const informacoesSociaisSchema =
  z.object({

    pessoa_id:
      z.string().uuid(),

    vinculo_programas:
      z.string()
        .optional(),

    veiculo:
      z.string()
        .optional(),

    animais:
      z.string()
        .optional(),

    meio_alertas:
      z.string()
        .optional(),

    destino_evacuacao:
      z.string()
        .optional(),

    contato_emergencia:
      z.string()
        .optional()

  });