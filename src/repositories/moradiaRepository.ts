import { pool } from "../config/database";
import { PoolClient } from "pg";

export class MoradiaRepository {
  async criar(dados: any, client?: PoolClient) {
    const db = client || pool;
    const query = `
      INSERT INTO moradia (
        pessoa_id,
        endereco,
        numero,
        bairro,
        cidade,
        cep,
        complemento,
        tipo_construcao,
        tempo_residencia,
        historico,
        uso_imovel,
        condicao,
        numero_pavimentos,
        sinais_alerta,
        grau_de_risco,
        riscos_moradia,
        numero_ficha,
        latitude,
        longitude
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19
      )
      RETURNING *
    `;

    const values = [
      dados.pessoa_id,
      dados.endereco,
      dados.numero,
      dados.bairro,
      dados.cidade,
      dados.cep,
      dados.complemento,
      dados.tipo_construcao,
      dados.tempo_residencia,
      dados.historico,
      dados.uso_imovel,
      dados.condicao,
      dados.numero_pavimentos,
      dados.sinais_alerta,
      dados.grau_de_risco,
      dados.riscos_moradia,
      dados.numero_ficha,
      dados.latitude,
      dados.longitude
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async buscarPorId(id: string) {
    const result = await pool.query(`SELECT * FROM moradia WHERE id = $1`, [id]);
    return result.rows[0];
  }

  async excluir(pessoaId: string) {
    const query = `UPDATE moradia SET "deletedAt" = NOW() WHERE pessoa_id = $1 RETURNING *`;
    const result = await pool.query(query, [pessoaId]);
    return result.rows[0];
  }

  private static readonly COLUNAS_PERMITIDAS = new Set([
    "endereco", "numero", "bairro", "cidade", "cep", "complemento",
    "tipo_construcao", "tempo_residencia", "historico", "uso_imovel",
    "condicao", "numero_pavimentos", "sinais_alerta", "grau_de_risco",
    "riscos_moradia", "numero_ficha", "latitude", "longitude"
  ]);

  async atualizar(id: string, dados: any) {
    const keys = Object.keys(dados).filter(k => MoradiaRepository.COLUNAS_PERMITIDAS.has(k));
    if (keys.length === 0) return this.buscarPorId(id);

    const fields = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const query = `UPDATE moradia SET ${fields} WHERE id = $1 RETURNING *`;
    const values = [id, ...keys.map(k => dados[k])];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}