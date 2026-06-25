import { pool }
from "../config/database";

export class NecessidadeRepository {

  async criar(dados: any) {

    const query = `
      INSERT INTO necessidade (

        pessoa_id,
        idosos,
        criancas,
        gestantes_lactantes,
        mobilidade_reduzida,
        doencas_cronicas,
        medicamentos_continuos,
        tipo_necessidade

      )

      VALUES (

        $1,$2,$3,$4,
        $5,$6,$7,$8

      )

      RETURNING *

    `;

    const values = [

      dados.pessoa_id,
      dados.idosos,
      dados.criancas,
      dados.gestantes_lactantes,
      dados.mobilidade_reduzida,
      dados.doencas_cronicas,
      dados.medicamentos_continuos,
      dados.tipo_necessidade

    ];

    const result =
      await pool.query(
        query,
        values
      );

    return result.rows[0];

  }

}