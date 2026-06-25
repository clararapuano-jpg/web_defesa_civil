import { pool }
from "../config/database";

export class InformacoesSociaisRepository {

  async criar(dados: any) {

    const query = `
      INSERT INTO informacoes_sociais (

        pessoa_id,
        vinculo_programas,
        veiculo,
        animais,
        meio_alertas,
        destino_evacuacao,
        contato_emergencia

      )

      VALUES (

        $1,$2,$3,$4,
        $5,$6,$7

      )

      RETURNING *

    `;

    const values = [

      dados.pessoa_id,
      dados.vinculo_programas,
      dados.veiculo,
      dados.animais,
      dados.meio_alertas,
      dados.destino_evacuacao,
      dados.contato_emergencia

    ];

    const result =
      await pool.query(
        query,
        values
      );

    return result.rows[0];

  }

}