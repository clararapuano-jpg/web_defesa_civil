import { pool }
from "../config/database";

export class ImagemRepository {

  async criar(dados: any) {

    const query = `
      INSERT INTO imagem (

        moradia_id,
        arquivo,
        nome_original,
        tipo_arquivo,
        tamanho

      )

      VALUES (

        $1,$2,$3,$4,$5

      )

      RETURNING *

    `;

    const values = [

      dados.moradia_id,
      dados.arquivo,
      dados.nome_original,
      dados.tipo_arquivo,
      dados.tamanho

    ];

    const result =
      await pool.query(
        query,
        values
      );

    return result.rows[0];

  }

}