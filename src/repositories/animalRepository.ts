import { pool } from "../config/database";
import { randomUUID } from "crypto";

export class AnimalRepository {
  async criar(dados: any) {
    const id = randomUUID();
    const query = `
      INSERT INTO animal (
        id,
        moradia_id,
        especie,
        nome,
        raca,
        porte,
        idade_aproximada,
        vacinacao_em_dia,
        temperamento,
        observacoes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const values = [
      id,
      dados.moradia_id,
      dados.especie,
      dados.nome,
      dados.raca,
      dados.porte,
      dados.idade_aproximada,
      dados.vacinacao_em_dia,
      dados.temperamento,
      dados.observacoes,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async buscarPorId(id: string) {
    const query = `SELECT * FROM animal WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async atualizarFoto(id: string, metadata: any) {
    const query = `
      UPDATE animal
      SET foto_arquivo = $2,
          foto_nome_original = $3,
          foto_tipo_arquivo = $4,
          foto_tamanho = $5
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      metadata.arquivo,
      metadata.nome_original,
      metadata.tipo_arquivo,
      metadata.tamanho,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
